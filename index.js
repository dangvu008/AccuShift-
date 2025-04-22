import { registerRootComponent } from "expo"
import App from "./App"
import SnackEntry from "./SnackEntry"

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App)

// For Snack compatibility
// Check if running in Snack environment
const isSnack = typeof window !== 'undefined' &&
               window.location &&
               window.location.hostname &&
               window.location.hostname.includes('snack.expo');

// Export the appropriate app version
export default isSnack ? SnackEntry : App
