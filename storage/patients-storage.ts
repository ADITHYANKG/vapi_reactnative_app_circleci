// storage/patients-storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { patientsSeed } from "@/components/patients-seed";

const KEY = "patients_list";

export async function loadPatients() {
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // First run → seed it
  await AsyncStorage.setItem(KEY, JSON.stringify(patientsSeed));
  return patientsSeed;
}

export async function savePatients(patients) {
  await AsyncStorage.setItem(KEY, JSON.stringify(patients));
}

export async function upsertPatientSummary({ patientName, finalSummary }) {
  const list = await loadPatients();
  const idx = list.findIndex(
    (p) =>
      p.patient_name.trim().toLowerCase() === patientName.trim().toLowerCase()
  );
  const now = new Date().toISOString();
  if (idx >= 0) {
    list[idx].final_summary = finalSummary;
    list[idx].date_modified = now;
  } else {
    list.push({
      caller_name: "Unknown",
      patient_name: patientName,
      date_created: now,
      date_modified: now,
      final_summary: finalSummary,
    });
  }
  await savePatients(list);
}
