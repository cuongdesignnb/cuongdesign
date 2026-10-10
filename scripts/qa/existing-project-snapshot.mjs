import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
import {PrismaClient} from '@prisma/client';
const testUrl='postgresql://qa:local_test_only@127.0.0.1:15439/cuongdesign_youtube_test?schema=public';
if(process.env.TEST_DATABASE_URL!==testUrl) throw new Error('Only the isolated QA database is allowed.');
const url='https://cuongdesign.net/du-an/website-ban-xe-dap-xe-dien-ahiu';
const response=await fetch(url);
if(response.status!==200)throw new Error(`Public read failed: ${response.status}`);
const doc=load(await response.text());
const title=doc('main h1').text().trim();
const sourceContent=doc('main article').html();
const images=doc('main img').filter((index,el)=>index>0&&!doc(el).closest('article').length).map((_,el)=>new URL(doc(el).attr('src'),url).href).get();
const bodyImages=doc('main article img').map((_,el)=>new URL(doc(el).attr('src'),url).href).get();
// Absolutize uploaded image sources only in the isolated fixture (do not download assets).
doc('main article img').each((_,el)=>doc(el).attr('src',new URL(doc(el).attr('src'),url).href));
const content=doc('main article').html();
const coverImage=new URL(doc('main img').first().attr('src'),url).href;
if(!title||!content||images.length+bodyImages.length!==6)throw new Error('Published snapshot does not match expected project evidence.');
const snapshot={source:url,timestamp:new Date().toISOString(),http:response.status,sourceKind:'Anonymous public HTML only, not CMS/DB export',title,sourceContent,fixtureContent:content,coverImage,galleryImages:images,bodyImages};
const db=new PrismaClient({datasources:{db:{url:testUrl}}});
try{
  const data={title,content,description:doc('meta[name=description]').attr('content')||'Public project snapshot',coverImage,images,techStack:['PHP','MySQL'],category:'Web Application',isPublished:true,robotsIndex:false,robotsFollow:true,youtubeUrl:null,seoKeywords:[],publishedAt:new Date('2026-10-01T00:00:00Z'),updatedAt:new Date('2026-10-10T00:00:00Z')};
  await db.project.upsert({where:{slug:'qa-ahiu-public-snapshot'},create:{...data,slug:'qa-ahiu-public-snapshot'},update:data});
  const out=path.resolve(process.env.QA_OUTPUT_DIR);await fs.mkdir(out,{recursive:true});
  await fs.writeFile(path.join(out,'ahiu-public-snapshot.json'),JSON.stringify(snapshot,null,2));
  console.log(`Read-only public snapshot copied to LOCAL test record: ${title}, ${images.length} gallery + ${bodyImages.length} body images. Production untouched.`);
}finally{await db.$disconnect();}
