import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { getActiveCountry } from "@/lib/storage";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

const SITE = "https://basiclaw.app";

export default function ChatTab() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setCountry(await getActiveCountry());
    })();
  }, []);

  if (!country) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.tint} />
      </View>
    );
  }

  const uri = `${SITE}/embed/ask?country=${encodeURIComponent(country)}&theme=auto`;

  return (
    <WebView
      source={{ uri }}
      style={{ flex: 1, backgroundColor: theme.background }}
      startInLoadingState
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
