const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

const vars = ["Fj", "rhe", "Xz", "Qz", "cq"];
vars.forEach(v => {
  let idx = code.indexOf(v + "=");
  if (idx === -1) idx = code.indexOf(v + " =");
  if (idx === -1) idx = code.indexOf("," + v + "=");
  if (idx === -1) idx = code.indexOf("," + v + " ");
  
  if (idx !== -1) {
    console.log(`\n--- Declaration of "${v}" around index ${idx} ---`);
    console.log(code.substring(idx - 100, idx + 250));
  } else {
    console.log(`Could not find declaration of "${v}"`);
  }
});
