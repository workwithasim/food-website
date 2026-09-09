import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

/**
 * Rider app root layout.
 * Authentication is handled in the (auth) group.
 */
export default function RiderRootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen
          name="deliveries/[deliveryId]"
          options={{ headerShown: true, title: "Delivery" }}
        />
      </Stack>
    </>
  );
}
