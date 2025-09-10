import rufusIcon from "@/assets/images/rufus.png";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, View } from "react-native";

// https://salamina.tech/blog/post/custom-tab-bar-tab-navigation-expo-react-native/
export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const tabWidth = tabBarWidth / state.routes.length;
  const indicatorPadding = 20; // px
  const indicatorWidth =
    tabWidth > 2 * indicatorPadding
      ? tabWidth - 2 * indicatorPadding
      : tabWidth;

  const translateX = useRef(
    new Animated.Value(state.index * tabWidth + indicatorPadding)
  ).current;

  useEffect(() => {
    // Animate indicator to correct position
    Animated.timing(translateX, {
      toValue: state.index * tabWidth + indicatorPadding,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth, indicatorPadding, translateX]);

  return (
    <View
      className="flex-row bg-white relative border-t border-gray-200"
      onLayout={(e) => setTabBarWidth(e.nativeEvent.layout.width)}
    >
      {/* Animated Tab Indicator */}
      {tabBarWidth > 0 && (
        <Animated.View
          className="absolute top-0 left-0 z-10 bg-dark rounded-b-lg h-1"
          style={{
            width: indicatorWidth,
            transform: [{ translateX }],
          }}
        />
      )}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <PlatformPressable
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            className={`flex-1 items-center justify-center py-2 pb-safe`}
          >
            {options.tabBarIcon && route.name !== "rufus" ? (
              options.tabBarIcon({
                focused: isFocused,
                color: "black",
                size: 24,
              })
            ) : (
              <Image source={rufusIcon} style={{ width: 40, height: 40 }} />
            )}
            {/* Tab label below icon */}
            {route.name !== "rufus" && (
              <Animated.Text
                className={`text-xs mt-1 ${isFocused ? "text-blue-700 font-bold" : "text-gray-500"}`}
                style={{ textAlign: "center" }}
              >
                {options.title ||
                  route.name.charAt(0).toUpperCase() + route.name.slice(1)}
              </Animated.Text>
            )}
          </PlatformPressable>
        );
      })}
    </View>
  );
}
