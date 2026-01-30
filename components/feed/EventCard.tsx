import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { Event } from "@/types/feed";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type Props = { event: Event };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const am = hour < 12;
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${am ? "AM" : "PM"}`;
}

export function EventCard({ event }: Props) {
  const iconColor = useThemeColor({}, "icon");

  return (
    <ThemedView style={styles.card}>
      <View style={styles.imageWrap}>
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <View
            style={[styles.placeholder, { backgroundColor: iconColor + "20" }]}
          >
            <MaterialIcons name="event" size={40} color={iconColor} />
          </View>
        )}
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>Event</ThemedText>
        </View>
        <View style={styles.dateStrip}>
          <ThemedText style={styles.dateStripText}>
            {formatDate(event.date)} · {formatTime(event.time)}
          </ThemedText>
        </View>
      </View>
      <View style={styles.content}>
        <ThemedText
          type="defaultSemiBold"
          style={styles.title}
          numberOfLines={1}
        >
          {event.title}
        </ThemedText>
        {event.academyName && (
          <ThemedText style={styles.academy} numberOfLines={1}>
            {event.academyName}
          </ThemedText>
        )}
        <ThemedText style={styles.description} numberOfLines={2}>
          {event.description}
        </ThemedText>
        <ThemedText style={styles.meta} numberOfLines={1}>
          {event.location}
        </ThemedText>
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
  dateStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  dateStripText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    marginBottom: 2,
  },
  academy: {
    fontSize: 13,
    opacity: 0.8,
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
  },
});
