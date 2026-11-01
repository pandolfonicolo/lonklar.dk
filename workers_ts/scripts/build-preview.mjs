/** Builds only. Does not provision resources, run SQL or deploy. */
import {readFile,writeFile,cp,rm,readdir,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {previewConfig,isolateHtml} from './preview-build-utils.mjs';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const configPath=join(root,'wrangler.preview.json');
// An unsuccessful build must never leave an old deployable config behind.
await rm(configPath,{force:true});
const config=previewConfig(process.env.PREVIEW_D1_DATABASE_ID);
const frontend=join(root,'../frontend');
for(const key of Object.keys(process.env))if(key.startsWith('VITE_'))delete process.env[key];
execFileSync('npm',['ci','--no-audit','--no-fund'],{cwd:frontend,stdio:'inherit'});
execFileSync('npm',['run','icons:check'],{cwd:frontend,stdio:'inherit'});
const staging=await mkdtemp(join(tmpdir(),'lonklar-preview-assets-'));
try {
  const {build}=await import(pathToFileURL(join(frontend,'node_modules/vite/dist/node/index.js')).href);
  let transformedMeta=false;
  await build({root:frontend,configFile:join(frontend,'vite.config.ts'),envFile:false,
    plugins:[{name:'isolated-preview-metadata',enforce:'pre',transform(source,id){
      if(id.replaceAll('\\','/').endsWith('/src/app/utils/usePageMeta.ts')){
        transformedMeta=true;
        // Build-only transform: keep title, never recreate production canonical/OG.
        return `import {useEffect} from 'react'; export function usePageMeta({title}) { useEffect(()=>{ document.title='TEST PREVIEW — '+title; },[title]); }`;
      }
    }}],build:{outDir:staging,emptyOutDir:true}});
  if(!transformedMeta)throw new Error('Preview metadata transform did not match expected frontend module');
  await writeFile(join(staging,'index.html'),isolateHtml(await readFile(join(staging,'index.html'),'utf8')));
  await writeFile(join(staging,'robots.txt'),'User-agent: *\nDisallow: /\n');
  await rm(join(staging,'sitemap.xml'),{force:true});
  for(const file of await readdir(join(staging,'assets'))){
    if(file.endsWith('.js')){
      const text=await readFile(join(staging,'assets',file),'utf8');
      if(/https?:\/\/(?:www\.)?lonklar\.dk\/api|analytics\.lonklar\.dk\/script/.test(text))throw new Error(`Production endpoint in ${file}`);
    }
  }
  // Publish only fully sanitized, validated assets; config is written last.
  const output=join(root,'public');
  await rm(output,{recursive:true,force:true});await cp(staging,output,{recursive:true});
  await writeFile(configPath,JSON.stringify(config,null,2)+'\n');
} finally {await rm(staging,{recursive:true,force:true});}
console.log('Isolated preview built. No resources created, database migrated, or code deployed.');
