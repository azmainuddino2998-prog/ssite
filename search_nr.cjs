const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

let idx = code.indexOf('Nr =');
if (idx === -1) idx = code.indexOf('Nr=');

if (idx !== -1) {
  console.log("Found Nr around:", idx);
  console.log(code.substring(idx - 100, idx + 500));
} else {
  console.log("Could not find Nr.");
}
