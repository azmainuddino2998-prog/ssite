const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

// Search for any strings starting with /api/
const matches = [];
const regex = /\/api\/[a-zA-Z0-9_\-\/]+/g;
let match;
while ((match = regex.exec(code)) !== null) {
  matches.push(match[0]);
}

console.log("Found API endpoints:", [...new Set(matches)]);
