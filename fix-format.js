const fs = require('fs');
const file = "app/(portals)/owner/components/ViewClientForms.tsx";

let content = fs.readFileSync(file, 'utf8');

// Find and replace the formatValue function
const oldPattern = /const formatValue = \(value: any\) => \{\s+if \(value === null \|\| value === undefined \|\| value === ''\) \{\s+return '<span class="text-gray-400 italic">— not provided —<\/span>';\s+\}\s+if \(typeof value === 'boolean'\) return value \? '✓ Yes' : '✗ No';\s+if \(Array\.isArray\(value\)\) return value\.join\(', '\);\s+if \(typeof value === 'object'\) return JSON\.stringify\(value\);\s+return String\(value\);\s+\}/s;

const newFunction = `const formatValue = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return '<span class="text-gray-400 italic">— not provided —</span>';
  }
  if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  const str = String(value);
  // Preserve line breaks for stacked fields
  if (str.includes('\\\\n')) {
    return str.replace(/\\\\n/g, '<br/>');
  }
  return str;
};`;

content = content.replace(oldPattern, newFunction);
fs.writeFileSync(file, content);
console.log("✅ Fixed formatValue function");
