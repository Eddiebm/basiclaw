import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { getActiveCountry } from "@/lib/storage";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

const SITE = "https://basiclaw.app";

export default function AuditTab() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const params = useLocalSearchParams<{ type?: string }>();
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

  const auditType = typeof params.type === "string" ? params.type : undefined;
  const q = new URLSearchParams({ country, theme: "auto" });
  if (auditType) q.set("type", auditType);
  const uri = `${SITE}/embed/audit?${q.toString()}`;

  return <WebView source={{ uri }} style={{ flex: 1, backgroundColor: theme.background }} startInLoadingState />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
