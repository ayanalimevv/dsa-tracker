import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for (const file of ['index.html','style.css','app.js','model.js','cloud.js','supabase-config.js','curriculum.js','problems.json']) await copyFile(file,`dist/${file}`);
console.log('Static site ready in dist/');
