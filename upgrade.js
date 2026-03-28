const fs = require('fs');
const path = require('path');

const root = 'c:/Users/Mustafa Kemal/Desktop/Afet-Y-netiminde-Verisi-Entegrasyonu-main';
const newCodeFolder = path.join(root, 'Afet-Y-netiminde-Verisi-Entegrasyonu--437cdbd6da125e180f3b711e3696df5a4373c88b');

// 1. Delete current Vercelified folders
const toDelete = ['src', 'api', 'public', 'index.html', 'vite.config.js', 'eslint.config.js', 'package.json', 'package-lock.json', 'vercel.json'];
toDelete.forEach(item => {
  const p = path.join(root, item);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
});

// 2. Move NEW code contents to root
const newFiles = fs.readdirSync(newCodeFolder);
newFiles.forEach(file => {
  fs.renameSync(path.join(newCodeFolder, file), path.join(root, file));
});

// 3. Delete the now-empty new Code Folder
fs.rmSync(newCodeFolder, { recursive: true, force: true });

// 4. Merge package.jsons
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8') || '{}');
const frontPkg = JSON.parse(fs.readFileSync(path.join(root, 'frontend/package.json'), 'utf8') || '{}');
const backPkg = JSON.parse(fs.readFileSync(path.join(root, 'backend/package.json'), 'utf8') || '{}');

const mergedPkg = {
  ...frontPkg,
  name: 'afet-app',
  dependencies: { ...rootPkg.dependencies, ...frontPkg.dependencies, ...backPkg.dependencies, "express": "^4.18.2", "cors": "^2.8.5", "dotenv": "^16.3.1" },
  devDependencies: { ...rootPkg.devDependencies, ...frontPkg.devDependencies, ...backPkg.devDependencies }
};
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(mergedPkg, null, 2));

// 5. Restructure for Vercel
fs.mkdirSync(path.join(root, 'api'));
fs.renameSync(path.join(root, 'backend/server.js'), path.join(root, 'api/index.js'));
fs.renameSync(path.join(root, 'backend/data'), path.join(root, 'api/data'));
fs.writeFileSync(path.join(root, 'api/package.json'), '{"type": "commonjs"}');

const frontFiles = fs.readdirSync(path.join(root, 'frontend'));
frontFiles.forEach(file => {
  if (file !== 'node_modules' && file !== 'package.json' && file !== 'package-lock.json') {
    fs.renameSync(path.join(root, 'frontend', file), path.join(root, file));
  }
});

fs.rmSync(path.join(root, 'frontend'), { recursive: true, force: true });
fs.rmSync(path.join(root, 'backend'), { recursive: true, force: true });

// 6. Fix App.jsx API URL
const appJsxPath = path.join(root, 'src/App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf8');
appJsx = appJsx.replace(/const API_BASE = 'http:\/\/localhost:5000';/g, "const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';");
fs.writeFileSync(appJsxPath, appJsx);

// 7. Cleanup
if (fs.existsSync(path.join(root, 'upgrade.js'))) {
    fs.unlinkSync(path.join(root, 'upgrade.js'));
}
