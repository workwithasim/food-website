import { Redirect } from "expo-router";

/**
 * Root route — redirect straight to the home tab.
 */
export default function Root() {
  return <Redirect href="/(tabs)/home" />;
}
