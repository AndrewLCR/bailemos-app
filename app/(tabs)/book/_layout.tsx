import { Stack } from "expo-router";

export default function BookLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="confirm/[eventId]" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
