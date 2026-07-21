const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

function extractFunction(pattern, outputFilename) {
  const index = code.indexOf(pattern);
  if (index === -1) {
    console.log(`Pattern "${pattern}" not found.`);
    return null;
  }

  // Find the start of the function body
  let bodyStartIndex = index + pattern.length;
  while (bodyStartIndex < code.length && code[bodyStartIndex] !== '{') {
    bodyStartIndex++;
  }

  if (bodyStartIndex >= code.length) {
    console.log(`Could not find opening brace for "${pattern}".`);
    return null;
  }

  // Braces matching
  let braceCount = 1;
  let i = bodyStartIndex + 1;
  let inString = null; // can be ", ', or `
  let isEscaped = false;

  while (i < code.length && braceCount > 0) {
    const char = code[i];

    if (isEscaped) {
      isEscaped = false;
      i++;
      continue;
    }

    if (char === '\\') {
      isEscaped = true;
      i++;
      continue;
    }

    if (inString) {
      if (char === inString) {
        inString = null;
      }
    } else {
      if (char === '"' || char === "'" || char === '`') {
        inString = char;
      } else if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      }
    }
    i++;
  }

  const funcCode = code.substring(index, i);
  fs.writeFileSync(outputFilename, funcCode);
  console.log(`Successfully extracted "${pattern}" (${funcCode.length} chars) to ${outputFilename}`);
  return funcCode;
}

// List of pages/components to extract
const targets = [
  { pattern: "function go(", file: "Navbar.js" },
  { pattern: "function RX(", file: "Hero.js" },
  { pattern: "function Ip(", file: "Chatbot.js" },
  { pattern: "function MX(", file: "Home.js" },
  { pattern: "function IX(", file: "ProductDetail.js" },
  { pattern: "function Bj(", file: "Category.js" },
  { pattern: "function DX(", file: "BestSellers.js" },
  { pattern: "function LX(", file: "Cart.js" },
  { pattern: "function $X(", file: "Contact.js" },
  { pattern: "function BX(", file: "OrderTracking.js" },
  { pattern: "function FX(", file: "Login.js" },
  { pattern: "function nhe(", file: "Admin.js" },
  { pattern: "function NI(", file: "AdminDashboard.js" },
  { pattern: "function Xde(", file: "AdminProducts.js" },
  { pattern: "function Yde(", file: "AdminCategories.js" },
  { pattern: "function Qde(", file: "AdminBanners.js" },
  { pattern: "function Jde(", file: "AdminSiteSettings.js" },
  { pattern: "function the(", file: "AdminOrders.js" }
];

targets.forEach(t => {
  extractFunction(t.pattern, t.file);
});
