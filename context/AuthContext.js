import { updateProfile as updateProfileApi } from "@/api/profile";
import { API_BASE } from "@/constants/api";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";

function userForSecureStore(userObj) {
  if (!userObj) return userObj;
  const avatar = userObj.avatar;
  const isOversizedAvatar =
    typeof avatar === "string" &&
    (avatar.startsWith("data:") || avatar.length > 2000);
  if (!isOversizedAvatar) return userObj;
  const { avatar: _avatar, ...rest } = userObj;
  return rest;
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = `${API_BASE}/auth`;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const userData = await SecureStore.getItemAsync("user");
        if (token && userData) {
          const parsed = JSON.parse(userData);
          setUser(parsed);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (e) {
        console.log("Error loading user", e);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const token = res.data?.token ?? res.data?.accessToken;
      if (!token) {
        return {
          success: false,
          error: "No token received",
        };
      }
      await SecureStore.setItemAsync("token", token);
      const userToStore = userForSecureStore(res.data);
      await SecureStore.setItemAsync("user", JSON.stringify(userToStore));
      setUser(res.data);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        role: "dancer",
      });
      const token = res.data?.token ?? res.data?.accessToken;
      if (!token) {
        return {
          success: false,
          error: "No token received",
        };
      }
      await SecureStore.setItemAsync("token", token);
      const userToStore = userForSecureStore(res.data);
      await SecureStore.setItemAsync("user", JSON.stringify(userToStore));
      setUser(res.data);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUser = async (updates) => {
    if (!user) return { success: false, error: "Not logged in" };
    const res = await updateProfileApi(updates);
    const fromApi = res.success && res.user ? res.user : {};
    const merged = { ...user, ...fromApi, ...updates };
    setUser(merged);
    const toStore = userForSecureStore(merged);
    await SecureStore.setItemAsync("user", JSON.stringify(toStore));
    return res.success
      ? { success: true, user: merged }
      : { success: false, error: res.error, user: merged };
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
