/**
 * Shared API base URL for all backend requests.
 * Use your machine's IP when testing on a physical device or Android emulator.
 * EXPO_PUBLIC_API_URL can override this (e.g. in .env).
 */
export const API_BASE =
  (typeof process !== "undefined" &&
    process.env?.EXPO_PUBLIC_API_URL?.replace(/\/$/, "")) ||
  "http://192.168.0.233:3000/api";
