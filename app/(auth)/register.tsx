import { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import "../../global.css"

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useContext(AuthContext);
  const router = useRouter();

  const handleRegister = async () => {
    const res = await register(name, email, password);
    if (res.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', res.error);
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-gray-900 p-6">
      <Text className="text-3xl font-bold text-white text-center mb-8">Dancer Registration</Text>
      
      <View className="space-y-4">
        <View>
            <Text className="text-gray-400 mb-2">Name</Text>
            <TextInput
            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
            placeholder="Your Name"
            placeholderTextColor="#6b7280"
            value={name}
            onChangeText={setName}
            />
        </View>

        <View>
            <Text className="text-gray-400 mb-2">Email</Text>
            <TextInput
            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
            placeholder="email@example.com"
            placeholderTextColor="#6b7280"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            />
        </View>

        <View>
            <Text className="text-gray-400 mb-2">Password</Text>
            <TextInput
            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700"
            placeholder="Password"
            placeholderTextColor="#6b7280"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            />
        </View>

        <TouchableOpacity 
          className="bg-blue-600 p-4 rounded-lg mt-6"
          onPress={handleRegister}
        >
          <Text className="text-white text-center font-bold text-lg">Sign Up</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
            <Text className="text-gray-400">Already have an account? </Text>
            <Link href="/login" className="text-blue-400 font-bold">Login</Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
