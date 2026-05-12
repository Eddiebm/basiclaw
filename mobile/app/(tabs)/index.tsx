import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
import { getActiveCountry, getUiLocale } from "@/lib/storage";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

const SITE = "https://basiclaw.app";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [country, setCountry] = useState("us");
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    void (async () => {
      setCountry(await getActiveCountry());
      setLocale(await getUiLocale());
    })();
  }, []);

  const open = useCallback((path: string) => {
    void WebBrowser.openBrowserAsync(`${SITE}/${locale}${path}`);
  }, [locale]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>BasicLaw</Text>
      <Text style={[styles.lead, { color: theme.tint }]}>Native shell · same educational web app</Text>
      <Text style={[styles.meta, { color: theme.tabIconDefault }]}>Active country: {country.toUpperCase()}</Text>

      <View style={styles.grid}>
        <Pressable style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={() => router.push("/chat")}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Chat (in app)</Text>
          <Text style={[styles.cardBody, { color: theme.tabIconDefault }]}>Embedded Ask widget</Text>
        </Pressable>
        <Pressable style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={() => router.push("/audit")}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Audit (in app)</Text>
          <Text style={[styles.cardBody, { color: theme.tabIconDefault }]}>Embedded audit widget</Text>
        </Pressable>
        <Pressable style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={() => open("/questions")}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Questions</Text>
          <Text style={[styles.cardBody, { color: theme.tabIconDefault }]}>Opens in browser</Text>
        </Pressable>
        <Pressable style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={() => open("/the-index")}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>The Index</Text>
          <Text style={[styles.cardBody, { color: theme.tabIconDefault }]}>Opens in browser</Text>
        </Pressable>
      </View>

      <Text style={[styles.legal, { color: theme.tabIconDefault }]}>
        Privacy: https://basiclaw.app/privacy · Terms: https://basiclaw.app/terms
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 48, gap: 16 },
  title: { fontSize: 28, fontWeight: "700" },
  lead: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  card: {
    width: "47%",
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  cardBody: { fontSize: 12, lineHeight: 16 },
  legal: { fontSize: 11, marginTop: 24, lineHeight: 16 },
});
