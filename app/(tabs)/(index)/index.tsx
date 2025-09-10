import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { patients } from '@/components/patientdata';

const recentPatient = patients[patients.length - 1];
function truncate(text: string, maxLength = 120) {
  return text.length > maxLength ? text.slice(0, maxLength - 3).trim() + '...' : text;
}

export default function HomeScreen() {
  const router = useRouter();
  const user = { firstname: 'User' }; // Replace with real user context if available
  return (
    <View style={styles.safe}>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} style={{ flex: 1 }}>
        {/* Greeting and Home Icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingTop: 8 }}>
          <Ionicons name="home" size={28} color="#6196e8" style={{ marginRight: 10 }} />
          <View>
            <Text style={{ color: '#282255ff', fontSize: 16 }}>Hello, <Text style={{ fontWeight: 'bold', color: '#1b2744' }}>{user.firstname}</Text> welcome to Ai voice agent</Text>
          </View>
        </View>

        {/* Most Recent Patient Card (Single) */}
        <TouchableOpacity
          style={styles.recentCard}
          activeOpacity={0.87}
          onPress={() => router.push('/(tabs)/dashboard')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flex: 1, marginLeft: 1 }}>
              <Text style={styles.recentName}>{recentPatient.patient_name}</Text>
              <Text style={styles.recentMeta}>{recentPatient.patient_age} yrs | {recentPatient.patient_sex}</Text>
              <Text style={styles.recentMeta}>Caller: {recentPatient.caller_name}</Text>
            </View>
            <View>
              <View style={styles.recentArrowCircle}>
                <Ionicons name="chevron-forward" size={22} color="#6196e8" />
              </View>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: '#87b1ee', marginVertical: 7, opacity: 0.5 }} />
          <Text style={styles.caseTitle}>Case History:</Text>
          <Text style={styles.caseDesc}>{truncate(recentPatient.case_history, 120)}</Text>
        </TouchableOpacity>

        {/* Search bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={22} color="#b1b4c0" style={{ marginRight: 9 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicine or health issue"
            placeholderTextColor="#b1b4c0"
          />
        </View>

        {/* Quick links row */}
        <View style={styles.quickRow}>
          <View style={styles.quickCircle}>
            <FontAwesome5 name="user-md" size={25} color="#67a6ec" />
          </View>
          <View style={styles.quickCircle}>
            <MaterialCommunityIcons name="pill" size={26} color="#67a6ec" />
          </View>
          <View style={styles.quickCircle}>
            <MaterialCommunityIcons name="hospital-building" size={26} color="#67a6ec" />
          </View>
        </View>
        <View style={styles.quickLabelRow}>
          <Text style={styles.quickLabel}>Doctor</Text>
          <Text style={styles.quickLabel}>Medicine</Text>
          <Text style={styles.quickLabel}>Hospital</Text>
        </View>

        {/* News/AI Info Card */}
        <View style={styles.doctorCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
            <Image
              source={{ uri: 'https://openstream.ai/hubfs/AI-Voice-Agent.png' }}
              style={styles.doctorAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#1b2744' }}>AI Medical Assistant for Smarter GI Case Decisions</Text>
              <Text style={{ color: '#a4aac0', fontSize: 14 }}>
                Listens to patient case reports, intelligently processes them, and keeps everything organized inside your CRM. View patient details, triage faster, and interact with a second expert agent for real-time disease detection — all in one seamless dashboard.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fbfaff' },
  recentCard: {
    backgroundColor: '#6196e8',
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 16,
    elevation: 6,
    marginTop: 4,
    marginBottom: 18,
    shadowColor: '#1b2b56',
    shadowOpacity: 0.10,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  recentName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  recentMeta: {
    color: '#e6effb',
    fontSize: 13,
    marginBottom: 2,
  },
  recentArrowCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6196e8',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  caseTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 3,
    fontSize: 14,
  },
  caseDesc: {
    color: '#f1f7fd',
    fontSize: 13,
    marginTop: 3,
  },
  searchBarContainer: {
    backgroundColor: '#f5f7fa',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginVertical: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#19233a',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 1,
  },
  quickCircle: {
    backgroundColor: '#f3f6fb',
    borderRadius: 40,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 1,
    elevation: 1,
  },
  quickLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 8,
    marginBottom: 6,
    marginTop: 0,
  },
  quickLabel: {
    fontSize: 13,
    color: '#a4aac0',
    textAlign: 'center',
    width: 60,
    fontWeight: '500',
  },
  doctorCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 14,
    elevation: 3,
    marginBottom: 18,
    marginTop: 10,
    shadowColor: '#1b2b56',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
  },
  doctorAvatar: {
    width: 60,
    height: 90,
    borderRadius: 0,
    marginRight: 8,
  },
});
