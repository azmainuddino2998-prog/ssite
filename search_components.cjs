const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

const components = {
  "MX (Home)": "function MX",
  "IX (ProductDetail)": "function IX",
  "Bj (Category)": "function Bj",
  "DX (BestSellers)": "function DX",
  "LX (Cart)": "function LX",
  "$X (Contact)": "function $X",
  "BX (OrderTracking)": "function BX",
  "FX (Login)": "function FX",
  "nhe (Admin)": "function nhe"
};

for (const [name, pattern] of Object.entries(components)) {
  let idx = code.indexOf(pattern);
  if (idx === -1) {
    console.log(`Component ${name} pattern "${pattern}" not found.`);
    continue;
  }
  console.log(`\n======================================================`);
  console.log(`Found ${name} at index ${idx}`);
  console.log(`======================================================`);
  // Print some characters of the component to verify it's the correct one
  console.log(code.substring(idx, idx + 800));
}
