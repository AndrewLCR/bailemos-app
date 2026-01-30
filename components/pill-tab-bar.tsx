import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_BG = "#010b24";
const PILL_BG = "rgba(255, 255, 255, 0.25)";
const INACTIVE_ICON = "#E8E6ED";
const ACTIVE_ICON_AND_TEXT = "#FFFFFF";

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

type TabLayout = { x: number; width: number };

export function PillTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const containerWidth = useRef(0);
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayout>>({});
  const pillLeft = useSharedValue(0);
  const pillWidth = useSharedValue(0);

  const activeIndex = state.index;
  const routes = state.routes;

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout;
    containerWidth.current = width;
  }, []);

  const handleTabContentLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      setTabLayouts((prev) => ({
        ...prev,
        [index]: { x, width: width + 24 },
      }));
    },
    [],
  );

  useEffect(() => {
    const layout = tabLayouts[activeIndex];
    const width = containerWidth.current;
    if (layout && width > 0) {
      const horizontalPadding = 16;
      const slotWidth = (width - horizontalPadding) / routes.length;
      const left = slotWidth * activeIndex + (slotWidth - layout.width) / 2;
      pillLeft.value = withSpring(left, SPRING_CONFIG);
      pillWidth.value = withSpring(layout.width, SPRING_CONFIG);
    }
  }, [activeIndex, tabLayouts, routes.length, pillLeft, pillWidth]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillLeft.value }],
    width: pillWidth.value,
  }));

  return (
    <View style={[styles.wrapper, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.container} onLayout={handleContainerLayout}>
        <Animated.View style={[styles.pill, pillAnimatedStyle]} />
        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            if (process.env.EXPO_OS === "ios") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconColor = isFocused ? ACTIVE_ICON_AND_TEXT : INACTIVE_ICON;

          return (
            <PlatformPressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? options.title ?? route.name
              }
            >
              {isFocused ? (
                <View
                  style={styles.activeContent}
                  onLayout={handleTabContentLayout(index)}
                >
                  {options.tabBarIcon?.({
                    focused: true,
                    color: iconColor,
                    size: 24,
                  }) ?? null}
                  <Text
                    style={[styles.label, { color: ACTIVE_ICON_AND_TEXT }]}
                    numberOfLines={1}
                  >
                    {options.title ?? route.name}
                  </Text>
                </View>
              ) : (
                <View style={styles.inactiveContent}>
                  {options.tabBarIcon?.({
                    focused: false,
                    color: iconColor,
                    size: 28,
                  }) ?? null}
                </View>
              )}
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: "center",
    backgroundColor: "#010b24",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: TAB_BAR_BG,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 8,
    minHeight: 56,
    position: "relative",
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      default: {},
    }),
  },
  pill: {
    position: "absolute",
    left: 8,
    top: 10,
    bottom: 10,
    backgroundColor: PILL_BG,
    borderRadius: 999,
    minWidth: 44,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  activeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  inactiveContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    maxWidth: 80,
  },
});
