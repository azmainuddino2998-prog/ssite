const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

const icons = ["Yu"];
icons.forEach(icon => {
  let idx = code.indexOf(icon + "=");
  if (idx === -1) idx = code.indexOf(icon + " =");
  if (idx === -1) idx = code.indexOf("," + icon + "=");
  if (idx === -1) idx = code.indexOf("," + icon + " ");
  
  if (idx !== -1) {
    console.log(`\n--- Declaration of "${icon}" around index ${idx} ---`);
    console.log(code.substring(idx - 150, idx + 250));
  } else {
    console.log(`Could not find declaration of "${icon}"`);
  }
});
