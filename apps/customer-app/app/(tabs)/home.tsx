import { View, Text, StyleSheet } from "react-native";

/** Menu / home screen — placeholder for catalog integration */
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <Text style={styles.subtitle}>Browse our menu here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 8 },
});
