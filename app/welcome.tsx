//C:\vapi-npm-15-Home-page-content-added-from-adithyan\app\welcome.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/rufus.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to ClareMD</Text>
        <Text style={styles.subtitle}>
          The smart assistant for doctors. Record, review, and triage patient cases 24X7.
        </Text>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.replace('/signUp')}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace('/signIn')}
        >
          <Text style={styles.loginText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23272A' },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#23272A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: width * 0.36,
    height: width * 0.36,
    marginBottom: 32,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  subtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  registerText: {
    color: '#23272A',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: '#5865F2',
    borderRadius: 24,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
