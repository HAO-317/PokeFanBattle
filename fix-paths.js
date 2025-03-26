import fs from 'fs';
import path from 'path';

const indexPath = path.join(process.cwd(), 'dist', 'index.html');
let content = fs.readFileSync(indexPath, 'utf-8');
content = content.replace(/\/assets\//g, '/Assets/');
fs.writeFileSync(indexPath, content, 'utf-8');
console.log('Fixed paths in index.html');