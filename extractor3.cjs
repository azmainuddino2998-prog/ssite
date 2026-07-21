const fs = require('fs');
const code = fs.readFileSync('target_js.js', 'utf8');

function extractFunctionFixed(pattern, outputFilename) {
  const index = code.indexOf(pattern);
  if (index === -1) {
    console.log(`Pattern "${pattern}" not found.`);
    return null;
  }

  // Find the closing parenthesis of the function parameters list
  let parenCount = 0;
  let hasSeenParen = false;
  let parenEndIndex = index + pattern.length;

  for (let idx = index + pattern.length - 1; idx < code.length; idx++) {
    const char = code[idx];
    if (char === '(') {
      parenCount++;
      hasSeenParen = true;
    } else if (char === ')') {
      parenCount--;
      if (hasSeenParen && parenCount === 0) {
        parenEndIndex = idx;
        break;
      }
    }
  }

  // Now find the first opening brace after the parameters list
  let bodyStartIndex = parenEndIndex + 1;
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

extractFunctionFixed("function wh(", "ProductCard.js");
