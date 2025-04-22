# AccuShift

A shift management and tracking application built with React Native and Expo.

## Running on Snack

To run this application on Snack:

1. Upload the code to Snack (https://snack.expo.dev/)
2. The application will automatically detect it's running in Snack environment and use the simplified version

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

1. Make sure all React components have proper imports (including the React import)
2. Check that the simplified version is being used by verifying the "Phiên bản đơn giản cho Snack" text appears
3. If issues persist, try running the prepare-snack script locally before uploading to Snack:
   ```bash
   npm run prepare-snack
   ```
