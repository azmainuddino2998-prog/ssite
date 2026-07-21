const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

// Let's find routes!
function searchFor(term, length = 1000) {
  let idx = 0;
  while (true) {
    idx = code.indexOf(term, idx);
    if (idx === -1) break;
    console.log(`\n--- Found "${term}" at index ${idx} ---`);
    console.log(code.substring(idx - 100, idx + term.length + length));
    idx += term.length;
    if (idx > 2000000) break; // prevent infinite loops if something goes wrong
  }
}

console.log("Searching for router definitions...");
searchFor("createBrowserRouter", 500);

console.log("Searching for Product details / schemas / dummy data...");
searchFor("entities.Product", 300);

console.log("Searching for paths/routes...");
searchFor("path:\"", 150);
