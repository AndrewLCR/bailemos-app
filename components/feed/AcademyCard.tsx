import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Academy } from "@/types/feed";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type Props = { academy: Academy };

export function AcademyCard({ academy }: Props) {
  const iconColor = useThemeColor({}, "icon");

  return (
    <ThemedView style={styles.card}>
      <View style={styles.imageWrap}>
        {academy.imageUrl ? (
          <Image
            source={{ uri: academy.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View
            style={[styles.placeholder, { backgroundColor: iconColor + "20" }]}
          >
            <MaterialIcons name="business" size={40} color={iconColor} />
          </View>
        )}
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>Academy</ThemedText>
        </View>
      </View>
      <View style={styles.content}>
        <ThemedText
          type="defaultSemiBold"
          style={styles.name}
          numberOfLines={1}
        >
          {academy.name}
        </ThemedText>
        <ThemedText style={styles.description} numberOfLines={2}>
          {academy.description}
        </ThemedText>
        <ThemedText style={styles.meta} numberOfLines={1}>
          {academy.location}
        </ThemedText>
        {academy.styles.length > 0 && (
          <View style={styles.chips}>
            {academy.styles.slice(0, 3).map((s) => (
              <View key={s} style={styles.chip}>
                <ThemedText style={styles.chipText}>{s}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrap: {
    height: 140,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 18,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(10, 126, 164, 0.15)",
  },
  chipText: {
    fontSize: 12,
    color: "#0a7ea4",
    fontWeight: "500",
  },
});
