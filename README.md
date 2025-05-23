# AccuShift

A shift management and tracking application built with React Native and Expo.

## Running on Snack

To run this application on Snack:

### Method 1: Using the auto-detection
1. Upload the code to Snack (https://snack.expo.dev/)
2. The application will automatically detect it's running in Snack environment and use the simplified version

### Method 2: Using the direct Snack entry point (recommended)
1. Upload the code to Snack (https://snack.expo.dev/)
2. In the Snack editor, open the App.js file
3. Replace the content with: `export { default } from './SnackApp';`
4. This will directly use the simplified version without any detection logic

## Development

For local development:

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Snack vs Full Version

When running on Snack, a simplified version of the app is used to ensure compatibility with the Snack environment. The full version includes more features and components that may not be compatible with Snack's limitations.

## Troubleshooting

If you encounter element type errors in Snack:

1. Use Method 2 from the "Running on Snack" section above (direct entry point)
2. Make sure all React components have proper imports (including the React import)
3. Check that the simplified version is being used by verifying the "Phiên bản đơn giản cho Snack" text appears
4. If you see DOM-related errors (like "Failed to execute 'removeChild' on 'Node'"), try using the direct entry point method
5. If issues persist, try running the prepare-snack script locally before uploading to Snack:
   ```bash
   npm run prepare-snack
   ```

## Direct Snack Entry

For the most reliable experience on Snack, create a new file in Snack called `App.js` with this content:

```javascript
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="time-outline" size={80} color="#4A6FFF" />
          <Text style={styles.appName}>AccuShift</Text>
        </View>
        <ActivityIndicator size="large" color="#4A6FFF" style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={32} color="#4A6FFF" />
        <Text style={styles.title}>AccuShift</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>Ứng dụng đang hoạt động</Text>
        <Text style={styles.subtitle}>Phiên bản đơn giản cho Snack</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main app styles
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6FFF',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },

  // Splash screen styles
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A6FFF',
    marginTop: 16,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
```
