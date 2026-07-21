const fs = require('fs');
const css = fs.readFileSync('target_css.css', 'utf8');

// Let's print sections of the CSS file containing custom glass or custom animations
const customSelectors = [".glass", ".glass-light", "glow-blue", "@keyframes", "pulse-glow"];
customSelectors.forEach(sel => {
  let idx = 0;
  while (true) {
    idx = css.indexOf(sel, idx);
    if (idx === -1) break;
    console.log(`\n--- Match for "${sel}" ---`);
    console.log(css.substring(idx - 50, idx + 250));
    idx += sel.length;
    break; // just show first match
  }
});
