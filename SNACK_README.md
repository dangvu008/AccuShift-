# AccuShift - Snack Version

This is a simplified version of AccuShift specifically designed to work in Expo Snack.

## How to Use in Snack

### Option 1: Create a New Snack Project

1. Go to [Expo Snack](https://snack.expo.dev/)
2. Create a new project
3. Replace the content of `App.js` with the content from `StandaloneSnackApp.js`
4. Run the project

### Option 2: Use the Standalone Files

If you're still encountering issues with the main project in Snack, use these standalone files:

1. Create a new Snack project
2. Create only these files:
   - `App.js` - Copy content from `StandaloneSnackApp.js`
   - `package.json` - Copy content from `snack.package.json`
   - `app.json` - Copy content from `snack.app.json`
3. Delete any other files
4. Run the project

## Troubleshooting

If you're seeing React errors like:

```
Error: Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined.
```

This usually means there's an issue with component imports. The standalone files provided here avoid this by not importing any external components.

### Common Issues in Snack

1. **Missing React Import**: Make sure every component file has `import React from 'react'` at the top
2. **Circular Dependencies**: Avoid circular imports between files
3. **DOM Manipulation Errors**: These can occur when React can't properly manage component mounting/unmounting
4. **Undefined Components**: Make sure all components are properly exported and imported

## Minimal Working Example

If all else fails, you can create a single `App.js` file with this content:

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AccuShift - Simple Version</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6FFF',
  },
});
```

This is the most minimal version that should work in any Snack environment.
