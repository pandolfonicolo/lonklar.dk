import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';

const config = JSON.parse(await readFile(new URL('../public/pages.json', import.meta.url)));
const base = 'http://127.0.0.1:8000';
let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser?.close(); });

async function open(t, options = {}) {
  const context = await browser.newContext(options);
  t.after(() => context.close());
  await context.route('**/*', route => new URL(route.request().url()).origin === base
    ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  t.after(() => assert.deepEqual(errors, [], 'No uncaught browser errors'));
  return page;
}

async function mounted(page) {
  await page.locator('.initial-page').waitFor({ state: 'detached' });
  await page.locator('#root > div').first().waitFor();
}

async function metadata(page, path) {
  const data = config.pages[path];
  await page.waitForFunction(title => document.title === title, data.title);
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), config.origin + path);
  for (const [selector, content] of [
    ['meta[name="description"]', data.description],
    ['meta[property="og:url"]', config.origin + path],
    ['meta[name="twitter:title"]', data.title],
    ['meta[name="robots"]', 'index,follow'],
  ]) assert.equal(await page.locator(selector).getAttribute('content'), content);
}

test('all eight sitemap pages load directly and retain their metadata after React mounts', async t => {
  const page = await open(t);
  for (const path of Object.keys(config.pages)) {
    const response = await page.goto(base + path);
    assert.equal(response.status(), 200, path);
    await mounted(page);
    assert.equal(await page.locator('h1').count(), 1, path);
    await metadata(page, path);
  }
});

test('all public pages have meaningful visible content without JavaScript', async t => {
  const page = await open(t, { javaScriptEnabled: false });
  for (const [path, data] of Object.entries(config.pages)) {
    assert.equal((await page.goto(base + path)).status(), 200);
    assert.equal(await page.locator('main h1').innerText(), data.heading);
    const text = await page.locator('main').innerText();
    for (const paragraph of data.paragraphs) assert.ok(text.includes(paragraph), path);
  }
});

test('initial content survives a delayed calculator chunk', async t => {
  const page = await open(t);
  let release;
  const delayed = new Promise(resolve => { release = resolve; });
  await page.route('**/assets/Wizard-*.js', async route => { await delayed; await route.continue(); });
  try {
    await page.goto(base + '/wizard/student', { waitUntil: 'commit' });
    await page.locator('.initial-page h1').waitFor();
    assert.equal(await page.locator('.initial-page h1').innerText(), config.pages['/wizard/student'].heading);
    assert.ok(await page.locator('.initial-page nav a').count() >= 8);
  } finally { release(); }
  await mounted(page);
  await metadata(page, '/wizard/student');
});

test('unknown URLs and invalid calculator IDs remain 404 pages after JavaScript runs', async t => {
  const page = await open(t);
  for (const path of ['/missing', '/wizard/missing', '/wizard/constructor', '/results/missing', '/ABOUT']) {
    assert.equal((await page.goto(base + path)).status(), 404, path);
    await mounted(page);
    assert.equal(await page.locator('h1').innerText(), 'Page not found');
    assert.equal(new URL(page.url()).pathname, path);
    assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
  }
  await page.getByRole('button', { name: 'Back to home', exact: true }).click();
  await page.waitForURL(base + '/');
  await metadata(page, '/');
});

test('SPA navigation and browser history reset noindex and update canonical and social metadata', async t => {
  const page = await open(t);
  await page.goto(base + '/results/fulltime');
  await mounted(page);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
  let reloads = 0;
  page.on('request', request => { if (request.isNavigationRequest()) reloads++; });
  for (const path of ['/about', '/contact']) {
    await page.locator(`header a[href="${path}"]`).first().click();
    await page.waitForURL(base + path);
    await metadata(page, path);
  }
  await page.goBack();
  await page.waitForURL(base + '/about');
  await metadata(page, '/about');
  assert.equal(reloads, 0, 'Internal links stay within the SPA');
});

for (const service of ['fulltime', 'parttime', 'student']) {
  test(`${service} calculator deep link still completes and results stay noindex`, async t => {
    const page = await open(t);
    const metaLoaded = page.waitForResponse(r => r.url() === base + '/api/meta' && r.status() === 200);
    await page.goto(base + '/wizard/' + service);
    await metaLoaded;
    await mounted(page);
    for (let step = 0; step < 3; step++) {
      await page.getByRole('button', { name: 'Next', exact: true }).click();
    }
    const computed = page.waitForResponse(r => r.url() === base + '/api/compute/' + service);
    await page.getByRole('button', { name: 'Calculate', exact: true }).click();
    assert.equal((await computed).status(), 200);
    await page.waitForURL(base + '/results/' + service);
    await page.waitForFunction(() => /\d/.test(document.querySelector('h1')?.textContent ?? ''));
    assert.equal(await page.locator('link[rel="canonical"]').count(), 0);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
    await page.reload();
    await mounted(page);
    assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,follow');
  });
}
