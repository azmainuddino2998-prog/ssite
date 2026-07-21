const fs = require('fs');
const css = fs.readFileSync('target_css.css', 'utf8');

// Search for color definitions or theme rules in the CSS
const keywords = ["obsidian", "cobalt", "silver", "gold", "glass-card"];
keywords.forEach(kw => {
  let idx = 0;
  while (true) {
    idx = css.indexOf(kw, idx);
    if (idx === -1) break;
    console.log(`\n--- Match for "${kw}" at index ${idx} ---`);
    console.log(css.substring(idx - 50, idx + 200));
    idx += kw.length;
    break; // just show first match
  }
});
