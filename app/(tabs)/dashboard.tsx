// app/(tabs)/dashboard.tsx
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { patients } from "@/components/patientdata";
// import { loadPatients } from "@/storage/patients-storage";
import PatientCard from "@/components/PatientCard";
import AssistantModal from "@/components/AssistantModal";
const STORAGE_KEY = "patients-overrides-v1";
const keyOf = (p: any) => (p.patient_name || "").trim();

async function loadPatientsMerged(base: typeof patients) {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const overrides = raw ? JSON.parse(raw) : {};
  return base.map((p) => ({ ...p, ...(overrides[keyOf(p)] || {}) }));
}
type Patient = (typeof patients)[number] & {
  final_summary?: string;
  date_modified?: string;
};

type CaseContext = {
  patientName?: string;
  age?: number | string;
  sex?: string;
  summary?: string;
};

export default function Dashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseContext | undefined>(
    undefined
  );
  const [sortType, setSortType] = useState("name-asc");
  // const [patients, setPatients] = useState([]);
  const [mergedPatients, setMergedPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // useEffect(() => {
  //   loadPatients().then(setPatients);
  // }, []);
  const refreshPatients = async () => {
    setLoading(true);
    const merged = await loadPatientsMerged(patients);
    setMergedPatients(merged);
    setLoading(false);
  };

  // initial load
  useEffect(() => {
    refreshPatients();
  }, []);

  // whenever the modal closes, reload in case a new final_summary was saved
  useEffect(() => {
    if (!modalVisible) {
      // slight delay lets onCallEnd finish writing to storage
      const t = setTimeout(() => refreshPatients(), 250);
      return () => clearTimeout(t);
    }
  }, [modalVisible]);
  const getSortedPatients = () => {
    let sorted = [...mergedPatients];
    switch (sortType) {
      case "name-asc":
        sorted.sort((a, b) => a.patient_name.localeCompare(b.patient_name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.patient_name.localeCompare(a.patient_name));
        break;
      case "age-asc":
        sorted.sort((a, b) => a.patient_age - b.patient_age);
        break;
      case "age-desc":
        sorted.sort((a, b) => b.patient_age - a.patient_age);
        break;
      case "gender-asc":
        sorted.sort((a, b) =>
          (a.patient_sex || "").localeCompare(b.patient_sex || "")
        );
        break;
      case "gender-desc":
        sorted.sort((a, b) =>
          (b.patient_sex || "").localeCompare(a.patient_sex || "")
        );
        break;
      case "date-asc":
        sorted.sort(
          (a, b) =>
            new Date(a.date_created).getTime() -
            new Date(b.date_created).getTime()
        );
        break;
      case "date-desc":
        sorted.sort(
          (a, b) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime()
        );
        break;
      default:
        break;
    }
    return sorted;
  };

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc" },
    { label: "Name (Z-A)", value: "name-desc" },
    { label: "Age (Ascending)", value: "age-asc" },
    { label: "Age (Descending)", value: "age-desc" },
    { label: "Gender (A-Z)", value: "gender-asc" },
    { label: "Gender (Z-A)", value: "gender-desc" },
    { label: "Date Created (Oldest)", value: "date-asc" },
    { label: "Date Created (Newest)", value: "date-desc" },
  ];

  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <>
      <View style={{ zIndex: 200 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: "#f3f4f6",
            justifyContent: "space-between",
            zIndex: 200,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>Patients</Text>
          <View style={{ position: "relative", zIndex: 201 }}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible((v) => !v)}
              activeOpacity={0.8}
            >
              <Ionicons name="funnel-outline" size={25} color="#333" />
            </TouchableOpacity>
            {dropdownVisible && (
              <>
                <Pressable
                  style={styles.dropdownOverlay}
                  onPress={() => setDropdownVisible(false)}
                />
                <View style={styles.dropdownMenu}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownItem,
                        sortType === option.value && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSortType(option.value);
                        setDropdownVisible(false);
                      }}
                    >
                      <Text
                        style={{
                          color: sortType === option.value ? "#6196e8" : "#222",
                          fontWeight:
                            sortType === option.value ? "bold" : "normal",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f3f4f6" }}
        contentContainerStyle={{ padding: 16 }}
      >
        {getSortedPatients().map((p, idx) => (
          <PatientCard
            key={p.patient_name + idx}
            patient={p}
            onPress={() => {
              console.log("patients", p);
              // Build a normalized case context from your patient record
              setSelectedCase({
                patientName: p.patient_name,
                age: p.patient_age,
                sex: p.patient_sex,
                summary:
                  (p.case_history as string) ??
                  (p.case_history as string) ??
                  "",
              });
              setModalVisible(true);
            }}
          />
        ))}
      </ScrollView>

      <AssistantModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        // 🔽 pass the normalized context
        caseContext={selectedCase}
      />
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 201,
  },
  dropdownMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
    zIndex: 202,
    minWidth: 180,
    paddingVertical: 4,
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  dropdownItemActive: {
    backgroundColor: "#f3f4f6",
  },
});
