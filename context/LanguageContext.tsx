import type { Locale } from "@/i18n/translations";
import { translations } from "@/i18n/translations";
import * as Localization from "expo-localization";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "app_language";

function getDeviceLocale(): Locale {
  try {
    const locales = Localization.getLocales();
    const first = locales?.[0];
    const code = first?.languageCode?.toLowerCase?.() ?? "en";
    return code.startsWith("es") ? "es" : "en";
  } catch {
    return "en";
  }
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (namespace: keyof (typeof translations)["en"], key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getDeviceLocale());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (cancelled) return;
        if (stored === "es" || stored === "en") {
          setLocaleState(stored);
        } else {
          setLocaleState(getDeviceLocale());
        }
      } catch {
        if (!cancelled) setLocaleState(getDeviceLocale());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (namespace: keyof (typeof translations)["en"], key: string): string => {
      const ns = translations[locale][namespace];
      if (ns && typeof ns === "object" && key in ns) {
        return (ns as Record<string, string>)[key] ?? key;
      }
      const enNs = translations.en[namespace];
      if (enNs && typeof enNs === "object" && key in enNs) {
        return (enNs as Record<string, string>)[key] ?? key;
      }
      return key;
    },
    [locale],
  );

  const value: LanguageContextValue = { locale, setLocale, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
