import { Stack } from "expo-router";

export default function AcademiesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="academy/[academyId]" />
    </Stack>
  );
}
