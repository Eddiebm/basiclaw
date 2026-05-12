import jurisdictions from "../../assets/jurisdictions.json";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { getUiLocale } from "@/lib/storage";
import { useEffect } from "react";

const SITE = "https://basiclaw.app";

type Row = { code: string; name: string; flag: string };

export default function LibraryTab() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [locale, setLocale] = useState("en");
  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    void (async () => {
      setLocale(await getUiLocale());
    })();
  }, []);

  if (selected) {
    const uri = `${SITE}/${locale}/constitutions/${selected.code}`;
    return (
      <View style={{ flex: 1 }}>
        <Pressable style={[styles.back, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setSelected(null)}>
          <Text style={{ color: theme.tint, fontWeight: "600" }}>← Directory</Text>
        </Pressable>
        <WebView source={{ uri }} style={{ flex: 1 }} startInLoadingState />
      </View>
    );
  }

  return (
    <FlatList
      data={jurisdictions as Row[]}
      keyExtractor={(item) => item.code}
      contentContainerStyle={{ padding: 12, backgroundColor: theme.background }}
      renderItem={({ item }) => (
        <Pressable
          style={[styles.row, { borderColor: theme.border, backgroundColor: theme.card }]}
          onPress={() => {
            setSelected(item);
          }}
        >
          <Text style={{ fontSize: 18 }}>{item.flag}</Text>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <Text style={{ color: theme.tabIconDefault, fontSize: 12 }}>{item.code.toUpperCase()}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: "600" },
  back: { padding: 12, borderBottomWidth: 1 },
});
