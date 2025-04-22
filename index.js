import { registerRootComponent } from "expo"
import SimpleApp from "./SimpleApp"

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(SimpleApp)

// For Snack compatibility
export default SimpleApp
