import Rufus from '@/components/Rufus';
import VapiOverlay from '@/components/VapiOverlay';
import { getArticleById } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '@/components/BottomSheetModal';
import { useHeaderHeight } from '@react-navigation/elements';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAsyncBoolean } from '@/hooks/useAsyncBoolean';

const MOCK_RATING = 4.5;
const MOCK_REVIEWS = 1193;
const MOCK_BRAND = 'Expo';
const MOCK_PRIME = true;

const SUGGESTED_PHRASES = [
  'What do customers say?',
  'What colours does it come in?',
  'What is the size?',
  'What is the weight?',
  'What is the material?',
  'What is the care instructions?',
  'What is the warranty?',
  'What is the return policy?',
  'What is the shipping policy?',
];



const Page = () => {
  const { id } = useLocalSearchParams();
  const headerHeight = useHeaderHeight();
  const [showOverlay] = useAsyncBoolean('vapi.overlay'); // <-- updated

  const { data, isLoading, isError } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticleById(+id),
  });

  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [showRufus, setShowRufus] = useState(true);

  // Open bottom sheet after mount (simulate previous behavior)
  useEffect(() => {
    const timer = setTimeout(() => {
      setBottomSheetVisible(true);
      setShowRufus(true);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  // Mimic snap points: showRufus for first, phrases for second
  const handleSnap = (index: number) => {
    setShowRufus(index === 0);
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ paddingTop: headerHeight || 120 }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (isError || !data) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ paddingTop: headerHeight || 120 }}>
        <Text>Failed to load product.</Text>
      </View>
    );
  }

  const onPhrasePress = async (phrase: string) => {
    // Placeholder for Rufus phrase press
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: headerHeight || 120 }}>
      {showOverlay && <VapiOverlay />}

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Product Image */}
        <View className="items-center bg-[#f7f7f7] p-4">
          <Image
            source={{ uri: data.imageUrl }}
            className="w-[220px] h-[220px] rounded-xl"
          />
        </View>

      {/* BottomSheetModal should be rendered here, not inside <Image> */}
      <BottomSheetModal
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        snapPoints={['25%', '50%']}
      >
        {showRufus ? (
          <View>
            <View className="flex-row items-center px-4 border-b border-gray-200 pb-2">
              <TouchableOpacity onPress={() => setShowRufus(false)}>
                <Ionicons name="close" size={24} className="text-gray-500" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-center flex-1">Rufus AI</Text>
            </View>
            <Rufus />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingLeft: 16 }}>
            {SUGGESTED_PHRASES.map((phrase, idx) => (
              <TouchableOpacity
                key={idx}
                style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9999, marginBottom: 8, height: 40, justifyContent: 'center' }}
                activeOpacity={0.7}
                onPress={() => onPhrasePress(phrase)}>
                <Text style={{ color: '#1D4ED8', fontWeight: '500', fontSize: 14 }}>{phrase}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </BottomSheetModal>
      </ScrollView>
    </View>
  );
};

export default Page;
