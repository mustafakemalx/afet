const fs = require('fs');
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
