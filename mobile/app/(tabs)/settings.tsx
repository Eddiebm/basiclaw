import { useCallback, useEffect, useState } from "react";
import { Appearance, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import {
  getActiveCountry,
  getThemePreference,
  getUiLocale,
  setActiveCountry,
  setThemePreference,
  setStoredPushToken,
  setUiLocale,
  type ThemePreference,
} from "@/lib/storage";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

const LOCALES = ["en", "es", "fr", "ar", "pt", "hi", "zh"] as const;
const COUNTRIES_QUICK = ["us", "gb", "gh", "ng", "in", "de", "fr", "br", "ca", "au"];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [country, setCountry] = useState("us");
  const [locale, setLocale] = useState("en");
  const [themePref, setThemePrefState] = useState<ThemePreference>("system");
  const [pushStatus, setPushStatus] = useState<string>("");

  useEffect(() => {
    void (async () => {
      setCountry(await getActiveCountry());
      setLocale(await getUiLocale());
      const tp = await getThemePreference();
      setThemePrefState(tp);
      Appearance.setColorScheme(tp === "system" ? null : tp);
    })();
  }, []);

  const applyTheme = useCallback(async (pref: ThemePreference) => {
    setThemePrefState(pref);
    await setThemePreference(pref);
    Appearance.setColorScheme(pref === "system" ? null : pref);
  }, []);

  const registerPushStub = useCallback(async () => {
    setPushStatus("Requesting…");
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        setPushStatus("Permission denied");
        return;
      }
      const tokenResp = await Notifications.getExpoPushTokenAsync();
      const token = tokenResp.data;
      await setStoredPushToken(token);
      setPushStatus("Token saved locally for future server use.");
    } catch (e) {
      setPushStatus(e instanceof Error ? e.message : "Push setup unavailable in this build");
    }
  }, []);

  const speakSample = useCallback(() => {
    void Speech.speak("BasicLaw native shell. For dictation inside chat, use the embedded web experience where the browser exposes speech recognition.", {
      language: locale === "en" ? "en-US" : locale,
    });
  }, [locale]);

  return (
    <ScrollView contentContainerStyle={[styles.wrap, { backgroundColor: theme.background }]}>
      <Text style={[styles.h, { color: theme.text }]}>Language</Text>
      <View style={styles.rowWrap}>
        {LOCALES.map((l) => (
          <Pressable
            key={l}
            onPress={() => void setUiLocale(l).then(() => setLocale(l))}
            style={[styles.chip, { borderColor: theme.border, backgroundColor: l === locale ? theme.tint : theme.card }]}
          >
            <Text style={{ color: l === locale ? "#fff" : theme.text, fontWeight: "600" }}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.h, { color: theme.text }]}>Default country (embeds)</Text>
      <View style={styles.rowWrap}>
        {COUNTRIES_QUICK.map((c) => (
          <Pressable
            key={c}
            onPress={() => void setActiveCountry(c).then(() => setCountry(c))}
            style={[styles.chip, { borderColor: theme.border, backgroundColor: c === country ? theme.tint : theme.card }]}
          >
            <Text style={{ color: c === country ? "#fff" : theme.text, fontWeight: "600" }}>{c.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.h, { color: theme.text }]}>Appearance</Text>
      <View style={styles.rowWrap}>
        {(["system", "light", "dark"] as const).map((p) => (
          <Pressable
            key={p}
            onPress={() => void applyTheme(p)}
            style={[styles.chip, { borderColor: theme.border, backgroundColor: p === themePref ? theme.tint : theme.card }]}
          >
            <Text style={{ color: p === themePref ? "#fff" : theme.text, fontWeight: "600" }}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.h, { color: theme.text }]}>Sign in (Clerk)</Text>
      <Pressable
        style={[styles.button, { backgroundColor: theme.tint }]}
        onPress={() => void WebBrowser.openBrowserAsync(`https://basiclaw.app/${locale}/sign-in`)}
      >
        <Text style={styles.buttonText}>Open hosted sign-in</Text>
      </Pressable>

      <Text style={[styles.h, { color: theme.text }]}>Push notifications (stub)</Text>
      <Pressable style={[styles.button, { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }]} onPress={() => void registerPushStub()}>
        <Text style={{ color: theme.text, fontWeight: "600" }}>Request permission & capture token</Text>
      </Pressable>
      {pushStatus ? <Text style={{ color: theme.tabIconDefault, fontSize: 12 }}>{pushStatus}</Text> : null}

      <Text style={[styles.h, { color: theme.text }]}>Voice</Text>
      <Text style={[styles.p, { color: theme.tabIconDefault }]}>
        On-device text-to-speech sample. For speech-to-text, rely on the chat WebView where the OS/browser exposes recognition.
      </Text>
      <Pressable style={[styles.button, { borderWidth: 1, borderColor: theme.border, backgroundColor: theme.card }]} onPress={speakSample}>
        <Text style={{ color: theme.text, fontWeight: "600" }}>Play TTS sample</Text>
      </Pressable>

      <Text style={[styles.h, { color: theme.text }]}>Legal</Text>
      <Pressable onPress={() => void WebBrowser.openBrowserAsync("https://basiclaw.app/privacy")}>
        <Text style={{ color: theme.tint, textDecorationLine: "underline" }}>Privacy policy</Text>
      </Pressable>
      <Pressable onPress={() => void WebBrowser.openBrowserAsync("https://basiclaw.app/terms")}>
        <Text style={{ color: theme.tint, textDecorationLine: "underline", marginTop: 8 }}>Terms of service</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingBottom: 48, gap: 12 },
  h: { fontSize: 16, fontWeight: "700", marginTop: 8 },
  p: { fontSize: 13, lineHeight: 18 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  button: { padding: 14, borderRadius: 14, alignItems: "center", marginTop: 4 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
