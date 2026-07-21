const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

let idx = code.indexOf('function BH');
if (idx === -1) idx = code.indexOf('BH=');

if (idx !== -1) {
  console.log("Found BH definition at index:", idx);
  console.log(code.substring(idx - 100, idx + 1000));
} else {
  console.log("Not found 'BH'. Let's search for 'BH =' or definitions around index 362000");
  console.log(code.substring(361000, 363000));
}
