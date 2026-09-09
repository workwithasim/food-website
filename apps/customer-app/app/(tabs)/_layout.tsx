import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

/**
 * Bottom tab navigator for main customer app screens.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#e8453c" }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
