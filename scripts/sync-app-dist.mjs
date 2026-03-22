import fs from 'fs';
import path from 'path';

const root = process.cwd();
const sourceDir = path.join(root, 'app', 'dist');
const targetDir = path.join(root, 'dist');

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
