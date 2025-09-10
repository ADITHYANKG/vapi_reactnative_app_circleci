import { CALL_STATUS, useVapi } from '@/hooks/useVapi';
import { MessageTypeEnum } from '@/utils/conversation.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAsyncBoolean } from '@/hooks/useAsyncBoolean';

const FADE_DURATION = 400;

const VapiOverlay = () => {
  const { startCall, isSpeaking, callStatus, messages, stop } = useVapi();
  const [showOverlay, setShowOverlay] = useAsyncBoolean('vapi.overlay');
  const [visible, setVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  useEffect(() => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start();
    startCall('assistant');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fade out on hide (when overlay is set to false)
  useEffect(() => {
    if (!showOverlay) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [showOverlay, fadeAnim]);

  useEffect(() => {
    if (callStatus === CALL_STATUS.FINISHED) {
      setShowOverlay(false);
    }
  }, [callStatus, setShowOverlay]);

  const onEndCall = () => {
    stop();
    setShowOverlay(false);
  };

  // Do not render anything if not visible
  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 70,
        width: '100%',
        height: '100%',
        zIndex: 20,
        justifyContent: 'center',
      }}
      // Remove className - now handled in style
    >
      {callStatus === CALL_STATUS.CONNECTING && (
        <Text style={{ fontWeight: '600', alignSelf: 'center' }}>
          Connecting to support....
        </Text>
      )}
      {(callStatus === CALL_STATUS.INACTIVE || callStatus === CALL_STATUS.FINISHED) && (
        <Text style={{ fontWeight: '600', alignSelf: 'center' }}>Inactive call</Text>
      )}

      {callStatus === CALL_STATUS.ACTIVE && (
        <>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {messages
              .filter((m) => m.type === MessageTypeEnum.TRANSCRIPT)
              .map((message, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 16,
                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <View
                    style={{
                      maxWidth: '80%',
                      borderRadius: 16,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      backgroundColor:
                        message.role === 'user' ? '#fdba74' : '#e5e7eb',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: '#1f2937' }}>{message.transcript}</Text>
                  </View>
                </View>
              ))}
          </ScrollView>

          <View style={{ flex: 1, alignItems: 'center' }}>
            {/* Microphone Icon with Animated Ping */}
            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSpeaking ? '#FFD814' : '#e5e7eb',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.09,
                  shadowRadius: 8,
                }}
              >
                <Ionicons name="mic" size={48} color="#151D26" />
              </View>
            </View>
            {/* End Call Button */}
            <TouchableOpacity
              style={{
                backgroundColor: '#ef4444',
                borderRadius: 9999,
                paddingHorizontal: 32,
                paddingVertical: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 4,
              }}
              onPress={onEndCall}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>End Call</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </Animated.View>
  );
};

export default VapiOverlay;
