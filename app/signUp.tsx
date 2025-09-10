import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const router = useRouter();

  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [emailStep, setEmailStep] = useState<'enter-email' | 'full-form'>('enter-email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Phone registration
  const [phone, setPhone] = useState('');

  // Email registration state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialty, setSpecialty] = useState<'gastro intestinal' | 'dermatology'>('gastro intestinal');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset email flow when toggling mode
  const handleToggleMode = (newMode: 'phone' | 'email') => {
    setMode(newMode);
    if (newMode === 'email') {
      setEmailStep('enter-email');
      setEmail('');
      setEmailError('');
    }
  };

  // --- Email Step 2: Full Registration Form ---
  if (mode === 'email' && emailStep === 'full-form') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.background} />
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => setEmailStep('enter-email')}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.heading}>Register with Email</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter first name"
          placeholderTextColor="#b9bbbe"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter last name"
          placeholderTextColor="#b9bbbe"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Specialty</Text>
        <View style={styles.dropdownWrapper}>
          <Picker
            selectedValue={specialty}
            style={styles.picker}
            onValueChange={(itemValue) => setSpecialty(itemValue)}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Gastro Intestinal" value="gastro intestinal" />
            <Picker.Item label="Dermatology" value="dermatology" />
          </Picker>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#b9bbbe"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { color: '#b9bbbe' }]}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#b9bbbe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#b9bbbe"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.nextBtn}
          disabled={loading}
          onPress={async () => {
            // Demo-only: validate and show success message
            if (!firstName || !lastName || !username || !password || !passwordConfirm) {
              Alert.alert('Error', 'All fields are required');
              return;
            }
            if (password.length < 6) {
              Alert.alert('Error', 'Password must be at least 6 characters');
              return;
            }
            if (password !== passwordConfirm) {
              Alert.alert('Error', 'Passwords do not match');
              return;
            }
            
            setLoading(true);

            try {
              console.log('Starting demo registration...');
              
              // IMPORTANT: Make sure user is NOT signed in
              await AsyncStorage.setItem('isSignedIn', 'false');
              
              // Clear any existing user data
              await AsyncStorage.removeItem('demoUser');
              
              // Save registration info separately (for demo purposes only)
              await AsyncStorage.setItem('demoRegistration', JSON.stringify({
                email,
                firstName,
                lastName,
                username,
                specialty,
                registeredAt: new Date().toISOString()
              }));
              
              console.log('Demo registration saved, user NOT signed in');
              
              setTimeout(() => {
                setLoading(false);
                console.log('Registration successful, navigating to welcome page...');
                router.replace('/welcome');
              }, 800);
              
            } catch (error) {
              console.error('Registration error:', error);
              setLoading(false);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
          }}
        >
          <Text style={styles.nextBtnText}>{loading ? 'Registering...' : 'Register'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  // --- Pill Toggle + Phone Registration + Email Step 1 ---
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.background} />
      <TouchableOpacity
        style={styles.backArrow}
        onPress={() => router.replace('/welcome')}
      >
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.heading}>Enter phone or email</Text>

      {/* Pill Toggle */}
      <View style={styles.pillToggleWrapper}>
        <TouchableOpacity
          style={[
            styles.pillBtn,
            mode === 'phone' ? styles.pillBtnActive : {},
          ]}
          onPress={() => handleToggleMode('phone')}
        >
          <Text style={[
            styles.pillBtnText,
            mode === 'phone' ? styles.pillBtnTextActive : {},
          ]}>
            Phone
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.pillBtn,
            mode === 'email' ? styles.pillBtnActive : {},
          ]}
          onPress={() => handleToggleMode('email')}
        >
          <Text style={[
            styles.pillBtnText,
            mode === 'email' ? styles.pillBtnTextActive : {},
          ]}>
            Email
          </Text>
        </TouchableOpacity>
      </View>

      {/* Phone Registration */}
      {mode === 'phone' && (
        <>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputWrapper}>
            <View style={styles.phoneCountry}>
              <Text style={styles.phoneCountryText}>+1</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone Number"
              placeholderTextColor="#b9bbbe"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              Alert.alert(
                'Demo Only', 
                'Phone registration is not implemented in this demo. Please use Email registration instead.',
                [
                  {
                    text: 'OK',
                    onPress: () => setMode('email')
                  }
                ]
              );
            }}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Email Registration Step 1 */}
      {mode === 'email' && emailStep === 'enter-email' && (
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#b9bbbe"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {!!emailError && (
            <Text style={{ color: '#ff6464', marginLeft: 28, marginBottom: 8 }}>{emailError}</Text>
          )}
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              if (!emailRegex.test(email)) {
                setEmailError('Please enter a valid email address.');
              } else {
                setEmailError('');
                setEmailStep('full-form');
              }
            }}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23272A' },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#23272A',
  },
  backArrow: {
    position: 'absolute',
    top: 54,
    left: 16,
    zIndex: 10,
  },
  heading: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 70,
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  pillToggleWrapper: {
    flexDirection: 'row',
    backgroundColor: '#1b1e21',
    borderRadius: 28,
    alignSelf: 'center',
    marginBottom: 32,
    width: width - 40,
    padding: 3,
  },
  pillBtn: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  pillBtnActive: {
    backgroundColor: '#23272A',
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 4,
  },
  pillBtnText: {
    color: '#8e9297',
    fontWeight: '700',
    fontSize: 16,
  },
  pillBtnTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  label: {
    color: '#b9bbbe',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 24,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#2f3136',
    borderRadius: 8,
    marginHorizontal: 24,
    marginBottom: 26,
    alignItems: 'center',
    borderColor: '#202225',
    borderWidth: 1,
  },
  phoneCountry: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 12,
  },
  phoneCountryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  nextBtn: {
    backgroundColor: '#5865F2',
    borderRadius: 24,
    width: width - 48,
    paddingVertical: 15,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  input: {
    width: width - 48,
    backgroundColor: '#2f3136',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    fontSize: 16,
    borderColor: '#202225',
    borderWidth: 1,
    marginBottom: 16,
    alignSelf: 'center',
  },
  dropdownWrapper: {
    width: width - 48,
    borderRadius: 8,
    backgroundColor: '#2f3136',
    marginBottom: 16,
    alignSelf: 'center',
    borderColor: '#202225',
    borderWidth: 1,
  },
  picker: {
    color: '#fff',
    width: '100%',
  },
});