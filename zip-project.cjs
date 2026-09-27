const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const outputFileName = 'my-mern-project.zip';
const outputPath = path.join(__dirname, outputFileName);

const zip = new AdmZip();

// Ignore panna vendiya folder/file names
const ignoreList = ['node_modules', '.git', 'build', 'dist', outputFileName];

function addFilesRecursively(dirPath, zipPath = '') {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (ignoreList.includes(item)) continue;

    const fullPath = path.join(dirPath, item);
    const relativeZipPath = path.join(zipPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      addFilesRecursively(fullPath, relativeZipPath);
    } else {
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

console.log('Zipping project files (excluding node_modules)...');

try {
  addFilesRecursively(__dirname);
  zip.writeZip(outputPath);

  const stats = fs.statSync(outputPath);
  console.log(`\nSuccess! Zip file created: ${outputFileName}`);
  console.log(`Total Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} catch (err) {
  console.error('Error zipping project:', err.message);
}