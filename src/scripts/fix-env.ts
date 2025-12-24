import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');

try {
  const content = fs.readFileSync(envPath, 'utf-8');
  
  // Split into lines
  const lines = content.split('\n');
  const newLines = [];
  let jsonBuffer = '';
  let collectingJson = false;

  for (const line of lines) {
    if (line.startsWith('FIREBASE_SERVICE_ACCOUNT_KEY=')) {
      collectingJson = true;
      const value = line.substring('FIREBASE_SERVICE_ACCOUNT_KEY='.length);
      jsonBuffer += value;
    } else if (collectingJson) {
      jsonBuffer += line;
    } else {
      newLines.push(line);
    }
  }

  if (collectingJson) {
    try {
      // Find the last closing brace to ignore any trailing garbage
      const lastBraceIndex = jsonBuffer.lastIndexOf('}');
      if (lastBraceIndex === -1) {
          throw new Error('No closing brace found');
      }
      
      const cleanedJson = jsonBuffer.substring(0, lastBraceIndex + 1).trim();
      const parsed = JSON.parse(cleanedJson);
      
      // If valid, stringify it back to a single line
      const singleLine = JSON.stringify(parsed);
      
      // Add to newLines, ensuring we wrap in single quotes just in case, though usually not strictly needed if valid JSON stringified
      // But standard .env often prefers single quotes for complex values
      newLines.push(`FIREBASE_SERVICE_ACCOUNT_KEY='${singleLine}'`);
      
      // Write back
      fs.writeFileSync(envPath, newLines.join('\n'));
      console.log('Successfully fixed .env.local format');
      
    } catch (e) {
      console.error('Failed to parse the collected JSON from .env.local');
      console.error(e);
      // For debugging, print a safe snippet
      console.log('Buffer start:', jsonBuffer.substring(0, 50));
    }
  } else {
    console.log('FIREBASE_SERVICE_ACCOUNT_KEY not found or format was different than expected.');
  }

} catch (err) {
  console.error('Error reading .env.local:', err);
}
