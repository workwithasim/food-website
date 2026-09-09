import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

/**
 * Root layout — wraps all screens in an Expo Router Stack navigator.
 * Authentication state is resolved in the (auth) and (tabs) route groups.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="orders/[orderId]" options={{ headerShown: true, title: "Order Details" }} />
        <Stack.Screen name="orders/[orderId]/track" options={{ headerShown: true, title: "Track Order" }} />
        <Stack.Screen name="support/[ticketId]" options={{ headerShown: true, title: "Support" }} />
      </Stack>
    </>
  );
}
