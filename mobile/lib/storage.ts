import AsyncStorage from "@react-native-async-storage/async-storage";

const COUNTRY_KEY = "basiclaw:active-country";
const THEME_KEY = "basiclaw:theme-preference";
const LOCALE_KEY = "basiclaw:ui-locale";
const PUSH_TOKEN_KEY = "basiclaw:expo-push-token";

export async function getActiveCountry(): Promise<string> {
  const v = await AsyncStorage.getItem(COUNTRY_KEY);
  return (v ?? "us").toLowerCase();
}

export async function setActiveCountry(code: string): Promise<void> {
  await AsyncStorage.setItem(COUNTRY_KEY, code.toLowerCase());
}

export type ThemePreference = "system" | "light" | "dark";

export async function getThemePreference(): Promise<ThemePreference> {
  const v = await AsyncStorage.getItem(THEME_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

export async function setThemePreference(pref: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, pref);
}

export async function getUiLocale(): Promise<string> {
  const v = await AsyncStorage.getItem(LOCALE_KEY);
  return (v ?? "en").toLowerCase();
}

export async function setUiLocale(locale: string): Promise<void> {
  await AsyncStorage.setItem(LOCALE_KEY, locale.toLowerCase());
}

export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

export async function setStoredPushToken(token: string): Promise<void> {
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
}
