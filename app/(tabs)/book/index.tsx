import { HeaderWithProfile } from "@/components/header-with-profile";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useBookableEvents, useBookings } from "@/hooks/useBookings";
import type { Booking } from "@/types/booking";
import type { Event } from "@/types/feed";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
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

function EventRow({ event }: { event: Event }) {
  const tint = useThemeColor({}, "tint");
  return (
    <Link href={`/(tabs)/book/confirm/${event._id}`} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <ThemedView style={styles.eventRow}>
          <View style={styles.eventInfo}>
            <ThemedText type="defaultSemiBold">{event.title}</ThemedText>
            <ThemedText style={styles.eventMeta}>
              {formatDate(event.date)} · {formatTime(event.time)} ·{" "}
              {typeof event.location === "string" ? event.location : ""}
            </ThemedText>
            {event.academyName && (
              <ThemedText style={styles.academyName}>
                {event.academyName}
              </ThemedText>
            )}
          </View>
          <MaterialIcons name="chevron-right" size={24} color={tint} />
        </ThemedView>
      </Pressable>
    </Link>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <ThemedView style={styles.bookingRow}>
      <View style={styles.bookingInfo}>
        <ThemedText type="defaultSemiBold">{booking.eventTitle}</ThemedText>
        <ThemedText style={styles.bookingMeta}>
          {formatDate(booking.eventDate)} · {formatTime(booking.eventTime)}
        </ThemedText>
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>{booking.status}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

export default function BookScreen() {
  const { t } = useLanguage();
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    refresh: refreshEvents,
  } = useBookableEvents();
  const {
    bookings,
    loading: bookingsLoading,
    refresh: refreshBookings,
  } = useBookings();
  const loading = eventsLoading;
  const refresh = () => {
    refreshEvents();
    refreshBookings();
  };

  if (eventsError && events.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ThemedText style={styles.errorText}>{eventsError}</ThemedText>
        <ThemedText onPress={refresh} style={styles.retry}>
          {t("book", "tapToRetry")}
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <HeaderWithProfile
        title={t("book", "title")}
        subtitle={t("book", "subtitle")}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading && events.length > 0}
            onRefresh={refresh}
            tintColor="#0a7ea4"
          />
        }
      >
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("book", "myBookings")}
          </ThemedText>
          {bookingsLoading && bookings.length === 0 ? (
            <ActivityIndicator
              size="small"
              color="#0a7ea4"
              style={styles.sectionLoader}
            />
          ) : bookings.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              {t("book", "noBookings")}
            </ThemedText>
          ) : (
            bookings.map((b) => <BookingRow key={b.id} booking={b} />)
          )}
        </View>
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t("book", "upcomingEvents")}
          </ThemedText>
          {loading ? (
            <ActivityIndicator
              size="small"
              color="#0a7ea4"
              style={styles.sectionLoader}
            />
          ) : (
            events.map((e) => <EventRow key={e._id} event={e} />)
          )}
        </View>
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
  scroll: { flex: 1 },
  list: { paddingBottom: 24 },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { marginBottom: 10 },
  sectionLoader: { marginVertical: 12 },
  emptyText: { fontSize: 15, opacity: 0.8, marginBottom: 8 },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  pressed: { opacity: 0.7 },
  eventInfo: { flex: 1 },
  eventMeta: { fontSize: 14, opacity: 0.8, marginTop: 2 },
  academyName: { fontSize: 13, opacity: 0.6, marginTop: 2 },
  bookingRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  bookingInfo: { flex: 1 },
  bookingMeta: { fontSize: 14, opacity: 0.8, marginTop: 2 },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  statusText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  errorText: { textAlign: "center", paddingHorizontal: 24 },
  retry: { marginTop: 12, color: "#FFFFFF", fontWeight: "600" },
});
