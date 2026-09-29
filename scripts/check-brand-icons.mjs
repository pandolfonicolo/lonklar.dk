import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// This checker is synchronized from nicolopandolfo.com with the icon assets.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  readFileSync(resolve(root, 'brand/icon.json'), 'utf8'),
);
for (const asset of manifest.files) {
  const bytes = readFileSync(resolve(root, asset.path));
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (hash !== asset.sha256) {
    throw new Error(
      `Brand asset changed: ${asset.path}. Regenerate from the shared brand/system.json.`,
    );
  }
  if (
    asset.size &&
    (bytes.readUInt32BE(16) !== asset.size ||
      bytes.readUInt32BE(20) !== asset.size)
  ) {
    throw new Error(`Incorrect icon dimensions: ${asset.path}`);
  }
  if (
    asset.path.endsWith('.svg') &&
    /<text\b|font-family|<image\b/.test(bytes.toString())
  ) {
    throw new Error(`Brand SVG must use vector outlines: ${asset.path}`);
  }
}
console.log(
  `${manifest.site}: ${manifest.version}, ${manifest.files.length} brand assets verified.`,
);
