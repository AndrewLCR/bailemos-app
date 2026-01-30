import { fetchBookableEvents } from "@/api/booking";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useCreateBooking } from "@/hooks/useBookings";
import type { Event } from "@/types/feed";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
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

export default function ConfirmBookingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const tint = useThemeColor({}, "tint");

  const handleSuccess = useCallback(() => {
    router.replace("/(tabs)/book/success");
  }, [router]);

  const { create, submitting } = useCreateBooking(handleSuccess);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const events = await fetchBookableEvents();
        const e = events.find((ev) => ev.id === eventId);
        if (!cancelled) setEvent(e ?? null);
      } catch {
        if (!cancelled) setEvent(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const onConfirm = async () => {
    if (!eventId) return;
    try {
      await create(eventId);
    } catch {
      Alert.alert(
        "Booking failed",
        "Could not complete booking. Please try again.",
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading…</ThemedText>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ThemedText style={styles.errorText}>Event not found</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={styles.link}>Go back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={tint} />
        </Pressable>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Confirm booking
        </ThemedText>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.card}>
          <ThemedText type="title" style={styles.title}>
            {event.title}
          </ThemedText>
          {event.academyName && (
            <ThemedText style={styles.academyName}>
              {event.academyName}
            </ThemedText>
          )}
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={20} color={tint} />
            <ThemedText style={styles.detailText}>
              {formatDate(event.date)}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={20} color={tint} />
            <ThemedText style={styles.detailText}>
              {formatTime(event.time)}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={20} color={tint} />
            <ThemedText style={styles.detailText}>{event.location}</ThemedText>
          </View>
          {event.description ? (
            <ThemedText style={styles.description}>
              {event.description}
            </ThemedText>
          ) : null}
        </ThemedView>
        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
            submitting && styles.confirmButtonDisabled,
          ]}
          onPress={onConfirm}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <ThemedText style={styles.confirmButtonText}>
              Confirm booking
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#010b24" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#010b24",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: "#010b24",
  },
  backButton: { padding: 4 },
  scroll: { flex: 1, backgroundColor: "#010b24" },
  scrollContent: { padding: 16, paddingBottom: 32 },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  title: { marginBottom: 4 },
  academyName: { fontSize: 16, opacity: 0.8, marginBottom: 16 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  detailText: { fontSize: 16, flex: 1 },
  description: { marginTop: 16, fontSize: 15, opacity: 0.9, lineHeight: 22 },
  confirmButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  confirmButtonPressed: { opacity: 0.9 },
  confirmButtonDisabled: { opacity: 0.7 },
  confirmButtonText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  loadingText: { marginTop: 8 },
  errorText: { textAlign: "center", paddingHorizontal: 24 },
  link: { marginTop: 12, color: "#0a7ea4", fontWeight: "600" },
});
