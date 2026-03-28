const fs = require('fs');
const path = require('path');

const root = 'c:/Users/Mustafa Kemal/Desktop/Afet-Y-netiminde-Verisi-Entegrasyonu-main';
const newCodeFolder = path.join(root, 'Afet-Y-netiminde-Verisi-Entegrasyonu--437cdbd6da125e180f3b711e3696df5a4373c88b');

// 1. Delete old stuff
const toDelete = ['src', 'api', 'public', 'index.html', 'vite.config.js', 'eslint.config.js'];
toDelete.forEach(item => {
  const p = path.join(root, item);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
});

// 2. Read packages BEFORE moving everything, to merge them safely
let frontPkgStr = "{}"; let backPkgStr = "{}"; let rootPkgStr = "{}";
try { frontPkgStr = fs.readFileSync(path.join(newCodeFolder, 'frontend/package.json'), 'utf8'); } catch(e){}
try { backPkgStr = fs.readFileSync(path.join(newCodeFolder, 'backend/package.json'), 'utf8'); } catch(e){}
try { rootPkgStr = fs.readFileSync(path.join(root, 'package.json'), 'utf8'); } catch(e){}

const frontPkg = JSON.parse(frontPkgStr);
const backPkg = JSON.parse(backPkgStr);
const rootPkg = JSON.parse(rootPkgStr);

const mergedPkg = {
  ...frontPkg,
  name: 'afet-app',
  dependencies: { ...rootPkg.dependencies, ...frontPkg.dependencies, ...backPkg.dependencies, "express": "^4.18.2", "cors": "^2.8.5", "dotenv": "^16.3.1" },
  devDependencies: { ...rootPkg.devDependencies, ...frontPkg.devDependencies, ...backPkg.devDependencies }
};
fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(mergedPkg, null, 2));

// 3. Create api folder and move backend
if (!fs.existsSync(path.join(root, 'api'))) {
    fs.mkdirSync(path.join(root, 'api'));
}
fs.renameSync(path.join(newCodeFolder, 'backend/server.js'), path.join(root, 'api/index.js'));
fs.renameSync(path.join(newCodeFolder, 'backend/data'), path.join(root, 'api/data'));

// 4. Move frontend items directly to root
const frontItems = fs.readdirSync(path.join(newCodeFolder, 'frontend'));
frontItems.forEach(file => {
  if (file !== 'node_modules' && file !== 'package.json' && file !== 'package-lock.json') {
    fs.renameSync(path.join(newCodeFolder, 'frontend', file), path.join(root, file));
  }
});

// 5. Delete raw inner folders
fs.rmSync(path.join(newCodeFolder, 'frontend'), { recursive: true, force: true });
fs.rmSync(path.join(newCodeFolder, 'backend'), { recursive: true, force: true });
fs.rmSync(newCodeFolder, { recursive: true, force: true });

// 6. Write api/package.json for CommonJS and update App.jsx API url
fs.writeFileSync(path.join(root, 'api/package.json'), '{\n  "type": "commonjs"\n}');

const appJsxPath = path.join(root, 'src/App.jsx');
let appJsx = fs.readFileSync(appJsxPath, 'utf8');
appJsx = appJsx.replace(/const API_BASE = 'http:\/\/localhost:5000';/g, "const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:5000';");
fs.writeFileSync(appJsxPath, appJsx);

console.log("Upgrade complete.");
