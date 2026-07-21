const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

// Let's search around "entities" or "Product.list"
let idx = code.indexOf('entities =');
if (idx === -1) idx = code.indexOf('entities=');
if (idx === -1) idx = code.indexOf('De =');
if (idx === -1) idx = code.indexOf('De=');

if (idx !== -1) {
  console.log("Found client definition at index:", idx);
  console.log(code.substring(idx - 100, idx + 1000));
} else {
  console.log("Not found directly. Let's search for any 'De.' calls or definitions of 'entities' structure.");
  // Find where .entities is assigned
  let idx2 = code.indexOf('.entities');
  if (idx2 !== -1) {
    console.log("Found .entities at index:", idx2);
    console.log(code.substring(idx2 - 100, idx2 + 500));
  }
}
