import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { patientCardStyles } from "./patientCardStyles";
import { Ionicons } from "@expo/vector-icons";
interface Patient {
  caller_name: string;
  patient_name: string;
  patient_age: number;
  patient_sex: string;
  case_history: string;
  final_summary?: string;
  date_modified?: string;
}

export default function PatientCard({
  patient,
  onPress,
}: {
  patient: Patient;
  onPress?: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [caseSummaryExpanded, setCaseSummaryExpanded] = React.useState(false);

  return (
    <View style={patientCardStyles.card}>
      <View style={patientCardStyles.headerRow}>
        <Text style={patientCardStyles.patientName}>
          {patient.patient_name}
        </Text>
        <Text style={patientCardStyles.patientInfo}>
          {patient.patient_age} yrs | {patient.patient_sex}
        </Text>
      </View>
      <Text style={patientCardStyles.callerText}>
        <Text style={patientCardStyles.label}>Caller: </Text>
        {patient.caller_name}
      </Text>

      <View style={patientCardStyles.caseHistoryContainer}>
        <Text style={patientCardStyles.caseHistoryLabel}>Case History: </Text>
        <Text
          style={patientCardStyles.caseHistory}
          numberOfLines={caseSummaryExpanded ? undefined : 4}
          ellipsizeMode="tail"
        >
          {patient.case_history}
        </Text>
        <TouchableOpacity
          onPress={() => setCaseSummaryExpanded((v) => !v)}
          style={{ alignSelf: "flex-start", paddingVertical: 4 }}
        >
          <Ionicons
            name={caseSummaryExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      {Boolean(patient.final_summary) && (
        <View style={patientCardStyles.caseHistoryContainer}>
          <Text style={patientCardStyles.caseHistoryLabel}>
            Final Summary:{" "}
          </Text>
          <Text
            style={patientCardStyles.caseSummary}
            numberOfLines={expanded ? undefined : 4}
            ellipsizeMode="tail"
          >
            {patient.final_summary}
          </Text>
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            style={{ marginTop: 6 }}
          >
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={16}
              color="#666"
            />
          </TouchableOpacity>

          {/* Optional: show last updated time if you want */}
          {patient.date_modified && (
            <Text style={{ marginTop: 6, opacity: 0.7, fontSize: 12 }}>
              Updated: {new Date(patient.date_modified).toLocaleString()}
            </Text>
          )}
        </View>
      )}
      <TouchableOpacity
        style={patientCardStyles.assessButton}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text style={patientCardStyles.assessButtonText}>Assess Patient</Text>
      </TouchableOpacity>
    </View>
  );
}
