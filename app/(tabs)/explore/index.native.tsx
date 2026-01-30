import { DEFAULT_MAP_CENTER } from "@/api/nearby";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useNearby } from "@/hooks/useNearby";
import type { NearbyPlace } from "@/types/nearby";
import { isNearbyAcademy, isNearbyEvent } from "@/types/nearby";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

function getPlaceTitle(place: NearbyPlace): string {
  return place.type === "academy" ? place.name : place.title;
}

function getPlaceSubtitle(place: NearbyPlace): string {
  return place.location;
}

export default function NearbyScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const { places, loading, error, refresh } = useNearby(userLocation);
  const [query, setQuery] = useState("");
  const searchBg = useThemeColor({}, "background");
  const searchBorder = useThemeColor(
    { light: "#e5e5e5", dark: "#2a2a2a" },
    "text",
  );
  const inputColor = useThemeColor({}, "text");

  const filteredPlaces = useMemo(() => {
    if (!query.trim()) return places;
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      const title = getPlaceTitle(p).toLowerCase();
      const location = p.location.toLowerCase();
      const styles = isNearbyAcademy(p) ? p.styles.join(" ").toLowerCase() : "";
      return title.includes(q) || location.includes(q) || styles.includes(q);
    });
  }, [places, query]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation(loc.coords);
        }
      } catch {
        // Location unavailable; nearby will use default center
      }
    })();
  }, []);

  const mapRef = useRef<MapView>(null);
  const region = useMemo(() => {
    const center = userLocation ?? DEFAULT_MAP_CENTER;
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  }, [userLocation]);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(region, 400);
    }
  }, [userLocation, region]);

  const handleCalloutPress = (place: NearbyPlace) => {
    if (isNearbyEvent(place)) {
      router.push(`/(tabs)/book/confirm/${place.id}`);
    } else if (isNearbyAcademy(place)) {
      router.push({
        pathname: `/(tabs)/explore/academy/${place.id}`,
        params: {
          name: place.name,
          description: place.description,
          location: place.location,
          styles: place.styles.join(","),
        },
      });
    }
  };

  if (loading && places.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <ThemedText style={styles.loadingText}>Loading map…</ThemedText>
      </SafeAreaView>
    );
  }

  if (error && places.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <ThemedText onPress={refresh} style={styles.retry}>
          Tap to retry
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={!!userLocation}
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={place.coordinates}
            title={getPlaceTitle(place)}
            description={getPlaceSubtitle(place)}
            pinColor={place.type === "academy" ? "#0a7ea4" : "#22c55e"}
            onCalloutPress={() => handleCalloutPress(place)}
          />
        ))}
      </MapView>
      <SafeAreaView
        style={styles.overlay}
        edges={["top"]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: searchBg, borderColor: searchBorder },
          ]}
        >
          <MaterialIcons name="search" size={22} color="#687076" />
          <TextInput
            style={[styles.searchInput, { color: inputColor }]}
            placeholder="Search academies & events…"
            placeholderTextColor="#687076"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </SafeAreaView>
      {filteredPlaces.length > 0 && (
        <View style={styles.countBadge} pointerEvents="none">
          <ThemedText style={styles.countText}>
            {filteredPlaces.length}{" "}
            {filteredPlaces.length === 1 ? "place" : "places"}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#010b24",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#010b24",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#11181C",
    paddingVertical: 0,
  },
  countBadge: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  loadingText: { marginTop: 8 },
  errorText: { textAlign: "center", paddingHorizontal: 24 },
  retry: { marginTop: 12, color: "#0a7ea4", fontWeight: "600" },
});
