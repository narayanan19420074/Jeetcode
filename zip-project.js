const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Output Zip File Name
const outputFileName = 'my-mern-project.zip';
const outputPath = path.join(__dirname, outputFileName);

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`\nSuccess! Zip file created: ${outputFileName}`);
  console.log(`Total Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Ignore panna vendiya folders / files
const ignorePatterns = [
  '**/node_modules/**',
  '**/.git/**',
  '**/build/**',
  '**/dist/**',
  outputFileName
];

// Current directory full-a add pannum (ignored folders thavirka)
archive.glob('**/*', {
  cwd: __dirname,
  ignore: ignorePatterns,
  dot: true // .env, .gitignore podra hidden files-um serthukolla
});

archive.finalize();