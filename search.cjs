const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

console.log("Analyzing file size:", code.length, "bytes");

// Let's search for some strings and print occurrences around them
function searchAround(term, count = 200, startOffset = 100) {
  const index = code.indexOf(term);
  if (index === -1) {
    console.log(`Term "${term}" not found.`);
    return;
  }
  console.log(`\n--- Found "${term}" at index ${index} ---`);
  const start = Math.max(0, index - startOffset);
  const end = Math.min(code.length, index + term.length + count);
  console.log(code.substring(start, end));
}

// Search for product definitions or product lists
searchAround("products", 1000, 100);
searchAround("Kozzak", 1000, 100);
searchAround("BDT", 1000, 100);
searchAround("৳", 1000, 100);
