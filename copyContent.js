const fs = require('fs-extra');
const path = require('path');

(async () => {
    const clipboardy = await import('clipboardy');
    const write = clipboardy.default.write; // Accessing the write method

    const baseDir = process.cwd(); // Get current directory
    const allowedDirs = ['routes', 'controllers', 'middleware', 'config', 'models', 'public/js', 'importFiles'];
    let allContent = '';

    function readDirRecursive(dir) {
        fs.readdirSync(dir).forEach((file) => {
            const fullPath = path.join(dir, file);

            // Ignore package.json and package-lock.json files
            if (file === 'package.json' || file === 'package-lock.json') {
                return;
            }

            if (fs.lstatSync(fullPath).isDirectory()) {
                const relativePath = path.relative(baseDir, fullPath);
                const topDir = relativePath.split(path.sep)[0];

                if (allowedDirs.includes(topDir)) {
                    readDirRecursive(fullPath);
                }
            } else {
                const content = fs.readFileSync(fullPath, 'utf8');
                allContent += `\n/* ${fullPath} */\n${content}\n`;
            }
        });
    }

    readDirRecursive(baseDir);

    await write(allContent);
    console.log('Selected content has been copied to the clipboard!');
})();
