import { StyledStack } from '@/components/navigation/stack';
import { Stack, useRouter } from 'expo-router';

const Layout = () => {
  const router = useRouter();
  return (
    <StyledStack contentClassName="bg-gray-100 dark:bg-background">
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
        }}
      />
    </StyledStack>
  );
};
export default Layout;
