import { StyleSheet } from "react-native";

export const patientCardStyles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderColor: "#D1D5DB", // gray-300
    borderWidth: 1,
    borderRadius: 16, // Tailwind's lg ~ 16px
    padding: 16, // Tailwind's p-4 ~ 16px
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
    // You may add transform on press for "hover:scale-105" feel in RN with Animated
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  patientName: {
    fontSize: 20, // Tailwind's text-xl
    fontWeight: "600",
    color: "black",
  },
  patientInfo: {
    color: "#4B5563", // gray-600
    fontSize: 14,
  },
  label: {
    fontWeight: "bold",
    fontSize: 14,
    color: "black",
  },
  callerText: {
    color: "#1F2937", // gray-800
    fontSize: 14,
    marginBottom: 12,
  },
  caseHistoryContainer: {
    marginBottom: 12,
  },
  caseHistoryLabel: {
    fontWeight: "bold",
    fontSize: 12,
    color: "black",
  },
  caseHistory: {
    color: "#374151", // gray-700
    fontSize: 12,
    // maxHeight: 80, // max-h-20 ~ 80px
    overflow: "hidden",
  },
  assessButton: {
    backgroundColor: "#22C55E", // green-500
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  assessButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  // patientCardStyles.ts
  caseSummary: {
    color: "#374151",
    fontSize: 12,
    // lineHeight: 18,
    overflow: "hidden",
    // no maxHeight, no overflow
  },
});
