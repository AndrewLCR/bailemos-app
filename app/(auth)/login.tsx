import { useLanguage } from "@/context/LanguageContext";
import { Link, useRouter } from "expo-router";
import { useContext, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import "../../global.css";

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    const res = await login(email, password);
    if (res.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(t("login", "errorTitle"), res.error);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-[#010b24] p-6">
      <Text className="text-3xl font-bold text-white text-center mb-8">
        {t("login", "title")}
      </Text>

      <View className="space-y-4">
        <View>
          <Text className="text-gray-400 mb-2">{t("login", "email")}</Text>
          <TextInput
            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
            placeholder={t("login", "emailPlaceholder")}
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-gray-400 mb-2">{t("login", "password")}</Text>
          <TextInput
            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
            placeholder={t("login", "passwordPlaceholder")}
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-[#4f2984] p-4 rounded-lg mt-6"
          onPress={handleLogin}
        >
          <Text className="text-white text-center font-bold text-lg">
            {t("login", "signIn")}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-400">{t("login", "noAccount")}</Text>
          <Link href="/register" className="text-blue-400 font-bold">
            {t("login", "register")}
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
