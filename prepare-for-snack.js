// This script prepares the app for Snack by copying the simplified configuration
const fs = require('fs');
const path = require('path');

// Copy app.snack.json to app.json
try {
  const snackConfig = fs.readFileSync(path.join(__dirname, 'app.snack.json'), 'utf8');
  fs.writeFileSync(path.join(__dirname, 'app.json'), snackConfig);
  console.log('Successfully copied app.snack.json to app.json');
} catch (error) {
  console.error('Error copying app.snack.json to app.json:', error);
}
