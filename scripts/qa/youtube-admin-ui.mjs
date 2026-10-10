import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';
const testUrl='postgresql://qa:local_test_only@127.0.0.1:15439/cuongdesign_youtube_test?schema=public';
if(process.env.TEST_DATABASE_URL!==testUrl) throw new Error('Only the isolated QA database is allowed.');
const {chromium}=await import(pathToFileURL(process.env.QA_PLAYWRIGHT_MODULE).href);
const db=new PrismaClient({datasources:{db:{url:testUrl}}});
const browser=await chromium.launch({channel:'chrome',headless:true});
const out=path.resolve(process.env.QA_OUTPUT_DIR);
await fs.mkdir(out,{recursive:true});
const results=[];
const a='https://www.youtube.com/watch?v=M7lc1UVf-VE',b='https://www.youtube.com/watch?v=dQw4w9WgXcQ';
async function login(page,base){
  await page.goto(`${base}/login`);
  await page.locator('input[type=email]').fill('qa-admin@local.test');
  await page.locator('input[type=password]').fill('local-qa-password');
  await page.locator('form button[type=submit]').click();
  await page.waitForURL(`${base}/admin`);
}
try{
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  for(const [base,version] of [['http://127.0.0.1:13442','before'],['http://127.0.0.1:13440','after']]){
    await login(page,base);
    const record=await db.project.findUnique({where:{slug:'qa-nail-equivalent'}});
    await page.goto(`${base}/admin/projects/${record.id}`);
    await page.locator('.ProseMirror h2').first().waitFor();
    const styles=await page.locator('.ProseMirror h2').first().evaluate(el=>({fontSize:getComputedStyle(el).fontSize,fontWeight:getComputedStyle(el).fontWeight}));
    assert.deepEqual(styles,{fontSize:'24px',fontWeight:'700'});
    await page.locator('.ProseMirror').first().scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(out,`${version}-admin-editor.png`)});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(out,`${version}-admin-editor-mobile.png`)});
    await page.setViewportSize({width:1440,height:900});
    results.push({version,editorHeading:styles,changedCmsRecord:false});
  }
  const base='http://127.0.0.1:13440';
  for(const entity of ['project','product']){
    const slug=`qa-ui-${entity}-${Date.now()}`;
    const videoSelector=`#${entity}-youtube-url`;
    const saveName=entity==='project'?'Lưu dự án':'Lưu sản phẩm';
    await page.goto(`${base}/admin/${entity}s/new`);
    await page.locator('input[name=title]').fill('LOCAL QA ONLY');
    await page.locator('input[name=slug]').fill(slug);
    await page.locator('textarea[name=description]').fill('Local-only fixture, never production.');
    await page.locator('input[name=techStack]').fill('PHP, MySQL');
    if(entity==='product'){
      await page.locator('input[name=price]').fill('150000');
      await page.locator('input[name=salePrice]').fill('120000');
      await page.locator('input[name=maxDownloads]').fill('7');
      await page.locator('input[name=features]').fill('Feature one, Feature two');
    }
    await page.locator(videoSelector).fill('https://youtu.be/M7lc1UVf-VE?si=ignored');
    await page.getByRole('button',{name:saveName,exact:true}).click();
    await page.waitForURL(`${base}/admin/${entity}s`);
    const original=await db[entity].findUnique({where:{slug}});
    assert.equal(original.youtubeUrl,a); assert.equal(original.isPublished,false);
    const fixedFields=record=>Object.fromEntries(Object.entries(record).filter(([key])=>!['youtubeUrl','updatedAt'].includes(key)));
    const reopen=async()=>{
      await page.goto(`${base}/admin/${entity}s`);
      await page.locator(`a[href="/admin/${entity}s/${original.id}"]`).click();
      await page.waitForFunction(selector=>document.querySelector(selector)?.value==='https://www.youtube.com/watch?v=M7lc1UVf-VE',videoSelector);
    };
    await reopen();
    await page.locator(videoSelector).fill('https://youtube.com.evil.test/watch?v=M7lc1UVf-VE');
    await page.getByRole('button',{name:saveName,exact:true}).click();
    await page.locator(`${videoSelector}-error`).waitFor();
    assert.equal(await page.locator(videoSelector).getAttribute('aria-invalid'),'true');
    assert.deepEqual(await db[entity].findUnique({where:{id:original.id}}),original);
    await page.screenshot({path:path.join(out,`${entity}-video-server-error.png`)});
    await page.locator(videoSelector).fill('https://youtube.com/shorts/dQw4w9WgXcQ');
    await page.getByRole('button',{name:saveName,exact:true}).click();
    await page.waitForURL(`${base}/admin/${entity}s`);
    const changed=await db[entity].findUnique({where:{id:original.id}});
    assert.equal(changed.youtubeUrl,b); assert.deepEqual(fixedFields(changed),fixedFields(original));
    await page.goto(`${base}/admin/${entity}s/${original.id}`);
    await page.waitForFunction(selector=>document.querySelector(selector)?.value==='https://www.youtube.com/watch?v=dQw4w9WgXcQ',videoSelector);
    await page.locator(videoSelector).fill('');
    await page.getByRole('button',{name:saveName,exact:true}).click();
    await page.waitForURL(`${base}/admin/${entity}s`);
    await page.goto(`${base}/admin/${entity}s/${original.id}`);
    await page.waitForFunction(()=>document.querySelector('input[name=title]')?.value==='LOCAL QA ONLY');
    assert.equal(await page.locator(videoSelector).inputValue(),'');
    const cleared=await db[entity].findUnique({where:{id:original.id}});
    assert.equal(cleared.youtubeUrl,null); assert.deepEqual(fixedFields(cleared),fixedFields(original));
    const other=await db[entity].findUnique({where:{slug:entity==='project'?'qa-project-video':'qa-product-video'}});
    await page.goto(`${base}/admin/${entity}s`);
    await page.locator(`a[href="/admin/${entity}s/${other.id}"]`).click();
    await page.waitForFunction(selector=>document.querySelector(selector)?.value==='https://www.youtube.com/watch?v=M7lc1UVf-VE',videoSelector);
    results.push({entity,create:'PASS',editAToB:'PASS',clearReload:'PASS',invalidServerFieldError:'PASS',invalidAtomicity:'PASS',draftPreserved:'PASS',nonVideoFields:'UNCHANGED',recordSwitch:'PASS'});
  }
  console.log('PASS: real local CMS UI login, create/edit/clear for both entities, accessible server validation, unchanged business/SEO/media and DRAFT status.');
}finally{
  await fs.writeFile(path.join(out,'admin-ui-results.json'),JSON.stringify(results,null,2));
  await browser.close(); await db.$disconnect();
}
