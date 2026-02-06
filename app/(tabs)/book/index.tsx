import type { MyBookingItem } from "@/api/booking";
import { HeaderWithProfile } from "@/components/header-with-profile";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useBookableEvents, useBookings } from "@/hooks/useBookings";
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

function formatDate(iso: string | undefined): string {
  if (!iso || typeof iso !== "string") return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatTime(t: string | undefined): string {
  if (!t || typeof t !== "string") return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return t;
  const am = hour < 12;
  const h12 = hour % 12 || 12;
  return `${h12}:${m ?? "00"} ${am ? "AM" : "PM"}`;
}

/** Derive display title from event or class booking. */
function getBookingTitle(b: MyBookingItem): string {
  const ev = b as { eventTitle?: string; event_title?: string };
  const cl = b as {
    className?: string;
    class_name?: string;
    class?: { name?: string };
    classId?: string;
  };
  return (
    ev.eventTitle ??
    ev.event_title ??
    cl.className ??
    cl.class_name ??
    cl.class?.name ??
    (cl.classId ? String(cl.classId) : null) ??
    "Booking"
  );
}

/** Derive display date/time from event or class booking. */
function getBookingSubtitle(b: MyBookingItem): string {
  const ev = b as {
    eventDate?: string;
    eventTime?: string;
    event_date?: string;
    event_time?: string;
  };
  const cl = b as { schedule?: string; createdAt?: string };
  const date = ev.eventDate ?? ev.event_date;
  const time = ev.eventTime ?? ev.event_time;
  if (date && time) {
    return `${formatDate(date)} · ${formatTime(time)}`;
  }
  return cl.schedule ?? (cl.createdAt ? formatDate(cl.createdAt) : "") ?? "";
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

function BookingRow({ booking }: { booking: MyBookingItem }) {
  const title = getBookingTitle(booking);
  const subtitle = getBookingSubtitle(booking);
  const status = (booking as { status?: string }).status ?? "—";
  return (
    <ThemedView style={styles.bookingRow}>
      <View style={styles.bookingInfo}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.bookingMeta}>{subtitle}</ThemedText>
        ) : null}
        <View style={styles.statusBadge}>
          <ThemedText style={styles.statusText}>{status}</ThemedText>
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
            bookings.map((b, index) => (
              <BookingRow
                key={b.id ? `${b.id}-${index}` : `booking-${index}`}
                booking={b}
              />
            ))
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
