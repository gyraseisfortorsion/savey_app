import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/src/stores/authStore';
import { useThemeStore } from '@/src/stores/themeStore';
import { useAppTheme } from '@/src/hooks/useAppTheme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 30_000 },
  },
});

function AuthGuard() {
  const { user, isLoading, restoreSession } = useAuthStore();
  const { loadTheme } = useThemeStore();
  const router = useRouter();
  const segments = useSegments();
  const splashHidden = useRef(false);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    (async () => {
      await loadTheme();
      await restoreSession();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    if (!splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync();
    }

    const inAuth = segments[0] === '(auth)';

    if (user === null && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user !== null && inAuth) {
      router.replace('/(tabs)');
    }
  }, [fontsLoaded, isLoading, user, segments]);

  return null;
}

export default function RootLayout() {
  const { isDark } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard />
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen
            name="transactions/index"
            options={{ headerShown: true, headerTitle: 'Transactions', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="transactions/add"
            options={{ headerShown: true, headerTitle: 'Add Transaction', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="transactions/[id]"
            options={{ headerShown: true, headerTitle: 'Edit Transaction', headerBackTitle: 'Back' }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
