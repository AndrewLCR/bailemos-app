import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export type AppButtonShape = "rounded" | "normal";
export type AppButtonVariant = "solid" | "outline";

export interface AppButtonProps {
  text: string;
  shape?: AppButtonShape;
  variant?: AppButtonVariant;
  onPress: () => void;
  backgroundColor: string;
  icon?: React.ReactNode;
  /** Text color; solid defaults to white, outline defaults to backgroundColor */
  textColor?: string;
  disabled?: boolean;
}

export function AppButton({
  text,
  shape = "normal",
  variant = "solid",
  onPress,
  backgroundColor,
  icon,
  textColor,
  disabled = false,
}: AppButtonProps) {
  const isRounded = shape === "rounded";
  const isOutline = variant === "outline";
  const color = backgroundColor ?? "#4f2983";

  const bgColor = isOutline ? "transparent" : color;
  const borderWidth = isOutline ? 2 : 0;
  const borderColor = isOutline ? color : "transparent";
  const labelColor = textColor ?? (isOutline ? color : "#ffffff");

  return (
    <View
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderWidth,
          borderColor,
          borderRadius: isRounded ? 12 : 4,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.pressable,
          { opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        <View style={styles.content}>
          {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
          <ThemedText style={[styles.text, { color: labelColor }]}>
            {text}
          </ThemedText>
        </View>
      </Pressable>
    </View>
  );
}

const MIN_HEIGHT = 48;

const styles = StyleSheet.create({
  button: {
    alignSelf: "stretch",
    minHeight: MIN_HEIGHT,
    height: MIN_HEIGHT,
    overflow: "hidden",
    justifyContent: "center",
  },
  pressable: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
