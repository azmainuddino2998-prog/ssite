const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

let idx = code.indexOf('function cT');
if (idx === -1) idx = code.indexOf('cT=');

if (idx !== -1) {
  console.log("Found cT definition at index:", idx);
  console.log(code.substring(idx - 100, idx + 1000));
} else {
  console.log("cT function not found directly. Searching for '.entities' or 'entities' creators around index 300000-360000");
  let idx2 = code.indexOf('entities:');
  if (idx2 !== -1) {
    console.log("Found entities: at index:", idx2);
    console.log(code.substring(idx2 - 100, idx2 + 500));
  }
}
