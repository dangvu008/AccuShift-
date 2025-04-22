export default {
  name: "Workly",
  slug: "workly",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.workly",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff",
    },
    package: "com.yourcompany.workly",
  },
  web: {
  },
  plugins: [],
  extra: {
    eas: {
      projectId: "your-project-id",
    },
  },
}
