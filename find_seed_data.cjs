const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

// Let's search for "create" with some properties like title, price, description
// or find all instances of .create( or .bulkCreate( or default values.
// We can find where products are listed, or where settings are defined.

function findMatch(regex, label) {
  console.log(`\n=== SEARCHING FOR: ${label} ===`);
  let match;
  let count = 0;
  while ((match = regex.exec(code)) !== null) {
    count++;
    console.log(`Match ${count} at index ${match.index}:`);
    console.log(code.substring(match.index - 50, match.index + 250));
    if (count >= 10) {
      console.log("...truncated after 10 matches...");
      break;
    }
  }
}

findMatch(/De\.entities\.Product\.(create|update|bulkCreate)/g, "Product.create");
findMatch(/De\.entities\.Category\.(create|update|bulkCreate)/g, "Category.create");
findMatch(/De\.entities\.SiteSettings\.(create|update|bulkCreate)/g, "SiteSettings.create");
findMatch(/title:\s*["'][^"']*(shirt|polo|trous|pant|jack|pant)/gi, "Specific product titles in strings");
