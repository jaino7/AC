const fs = require('fs');
const path = require('path');

const THEMES = ['creator-pro', 'neon-pro', 'studio-pro', 'velvet-pro', 'pure-lite', 'zine-lite'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const appDir = path.join(__dirname, 'apps', 'web', 'app');
const themeDirs = THEMES.map(t => path.join(appDir, t));

let totalRemoved = 0;

themeDirs.forEach(themeDir => {
    if (fs.existsSync(themeDir)) {
        const files = walk(themeDir);
        files.forEach(file => {
            let content = fs.readFileSync(file, 'utf8');
            if (content.includes('displayName="ユーザー"')) {
                content = content.replace(/displayName="ユーザー"/g, '');
                fs.writeFileSync(file, content, 'utf8');
                console.log('Removed from:', file);
                totalRemoved++;
            }
        });
    }
});

console.log(`Total removals in themes: ${totalRemoved}`);

// SimpleAccountPage fallback
const simpleAccountPagePath = path.join(__dirname, 'apps', 'web', 'components', 'account', 'simple-account-page.tsx');
if (fs.existsSync(simpleAccountPagePath)) {
    let content = fs.readFileSync(simpleAccountPagePath, 'utf8');
    if (content.includes('|| "ユーザー"')) {
        content = content.replace(/\|\| "ユーザー"/g, '');
        fs.writeFileSync(simpleAccountPagePath, content, 'utf8');
        console.log('Removed fallback from simple-account-page.tsx');
    }
}

// [handle]/content/page.tsx fallback
const handleContentPagePath = path.join(__dirname, 'apps', 'web', 'app', '[handle]', 'content', 'page.tsx');
if (fs.existsSync(handleContentPagePath)) {
    let content = fs.readFileSync(handleContentPagePath, 'utf8');
    if (content.includes('|| "ユーザー"')) {
        content = content.replace(/\|\| "ユーザー"/g, '|| "ゲスト"');
        fs.writeFileSync(handleContentPagePath, content, 'utf8');
        console.log('Replaced fallback from [handle]/content/page.tsx');
    }
}
