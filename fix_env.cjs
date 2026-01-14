
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
let content = fs.readFileSync(envPath, 'utf8');

// Remove anything that looks like JSON at the end of the file
// Usually starts with { and ends with }
const jsonStart = content.indexOf('{');
if (jsonStart !== -1) {
    console.log('Found JSON-like block in .env, removing...');
    const newContent = content.substring(0, jsonStart).trim();
    fs.writeFileSync(envPath, newContent);
    console.log('Fixed frontend/.env');
} else {
    console.log('No JSON block found in frontend/.env');
}
