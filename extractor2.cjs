const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

function extractPattern(pattern, length, filename) {
  const index = code.indexOf(pattern);
  if (index === -1) {
    console.log(`Pattern "${pattern}" not found.`);
    return;
  }
  console.log(`\n--- Extracted "${pattern}" at ${index} ---`);
  const content = code.substring(index, index + length);
  fs.writeFileSync(filename, content);
  console.log(`Saved to ${filename}`);
}

// Let's also use our smart braces-matching function to extract complete function bodies!
function extractFunction(pattern, outputFilename) {
  const index = code.indexOf(pattern);
  if (index === -1) {
    console.log(`Pattern "${pattern}" not found.`);
    return null;
  }

  let bodyStartIndex = index + pattern.length;
  while (bodyStartIndex < code.length && code[bodyStartIndex] !== '{') {
    bodyStartIndex++;
  }

  if (bodyStartIndex >= code.length) {
    console.log(`Could not find opening brace for "${pattern}".`);
    return null;
  }

  let braceCount = 1;
  let i = bodyStartIndex + 1;
  let inString = null;
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

extractFunction("function wh(", "ProductCard.js");
extractFunction("function bo(", "Footer.js");

// Let's find "NX =" or "NX="
let idxNX = code.indexOf("NX =");
if (idxNX === -1) idxNX = code.indexOf("NX=");
if (idxNX !== -1) {
  console.log("Found NX definition around index:", idxNX);
  fs.writeFileSync("NX_banner.js", code.substring(idxNX - 100, idxNX + 1000));
}

// Let's find "Wy =" or "Wy=" (Order statuses)
let idxWy = code.indexOf("Wy =");
if (idxWy === -1) idxWy = code.indexOf("Wy=");
if (idxWy !== -1) {
  console.log("Found Wy definition around index:", idxWy);
  fs.writeFileSync("Wy_status.js", code.substring(idxWy - 100, idxWy + 1000));
}
