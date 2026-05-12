import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Linking from "expo-linking";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { getThemePreference, type ThemePreference } from "@/lib/storage";
import { Appearance } from "react-native";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function applyStoredAppearance(pref: ThemePreference) {
  Appearance.setColorScheme(pref === "system" ? undefined : pref);
}

function useDeepLinks() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (raw: string) => {
      if (!raw.startsWith("basiclaw://")) return;
      let u: URL;
      try {
        u = new URL(raw);
      } catch {
        return;
      }
      const host = u.hostname.toLowerCase();
      if (host === "chat") {
        router.replace("/chat");
        return;
      }
      if (host === "audit") {
        const type = u.searchParams.get("type") ?? undefined;
        if (type) {
          router.replace({ pathname: "/audit", params: { type } });
        } else {
          router.replace("/audit");
        }
      }
    };

    const sub = Linking.addEventListener("url", (e) => {
      handleUrl(e.url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    return () => sub.remove();
  }, [router]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    void (async () => {
      const pref = await getThemePreference();
      applyStoredAppearance(pref);
    })();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  useDeepLinks();

  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const mergedTheme = {
    ...navigationTheme,
    fonts: {
      regular: {
        fontFamily: "Inter_400Regular",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "Inter_500Medium",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "Inter_700Bold",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "Inter_700Bold",
        fontWeight: "700" as const,
      },
    },
  };

  return (
    <ThemeProvider value={mergedTheme}>
      <Stack screenOptions={{ headerTitleStyle: { fontFamily: "Inter_600SemiBold" } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
