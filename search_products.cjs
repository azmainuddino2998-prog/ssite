const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

// Search for strings that look like product data: e.g. "category" or specific names
const keywords = [
  "Premium Slim Fit",
  "Polo",
  "T-shirt",
  "T-Shirt",
  "Shirt",
  "Trouser",
  "Jacket",
  "Panjabi",
  "Denim",
  "Cotton",
  "Kozzak",
];

keywords.forEach(kw => {
  let idx = 0;
  let count = 0;
  while (true) {
    idx = code.indexOf(kw, idx);
    if (idx === -1) break;
    count++;
    if (count <= 3) { // just print the first 3 matches for each keyword
      console.log(`\n--- Match for "${kw}" at index ${idx} ---`);
      console.log(code.substring(idx - 100, idx + kw.length + 300));
    }
    idx += kw.length;
  }
});
