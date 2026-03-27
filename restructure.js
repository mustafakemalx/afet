const fs = require('fs');
const path = require('path');

const rootPkg = JSON.parse(fs.readFileSync('./package.json', 'utf8') || '{}');
const frontPkg = JSON.parse(fs.readFileSync('./frontend/package.json', 'utf8') || '{}');
const backPkg = JSON.parse(fs.readFileSync('./backend/package.json', 'utf8') || '{}');

const mergedPkg = {
  ...frontPkg,
  name: 'afet-app',
  dependencies: { ...rootPkg.dependencies, ...frontPkg.dependencies, ...backPkg.dependencies },
  devDependencies: { ...rootPkg.devDependencies, ...frontPkg.devDependencies, ...backPkg.devDependencies }
};

fs.writeFileSync('./package.json', JSON.stringify(mergedPkg, null, 2));
if (fs.existsSync('vercel.json')) fs.unlinkSync('vercel.json');
if (!fs.existsSync('api')) fs.mkdirSync('api');

// Handle Backend
if (fs.existsSync('backend/server.js')) fs.renameSync('backend/server.js', 'api/index.js');
if (fs.existsSync('backend/data')) fs.renameSync('backend/data', 'api/data');

// Handle Frontend
const frontFiles = fs.readdirSync('frontend');
for (const file of frontFiles) {
  if (file !== 'node_modules' && file !== 'package.json' && file !== 'package-lock.json') {
    fs.renameSync(path.join('frontend', file), file);
  }
}

// Cleanup
fs.rmSync('frontend', { recursive: true, force: true });
fs.rmSync('backend', { recursive: true, force: true });
fs.unlinkSync('restructure.js');
