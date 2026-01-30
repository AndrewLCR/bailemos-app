export type Locale = "en" | "es";

export const translations = {
  en: {
    tabs: {
      home: "Home",
      nearby: "Nearby",
      book: "Book",
      profile: "Profile",
    },
    profile: {
      title: "Profile",
      subtitle: "Your account and preferences",
      user: "User",
      myBookings: "My bookings",
      account: "Account",
      settings: "Settings",
      language: "Language",
      session: "Session",
      logOut: "Log out",
      languageEnglish: "English",
      languageSpanish: "Español",
    },
  },
  es: {
    tabs: {
      home: "Inicio",
      nearby: "Cerca",
      book: "Reservar",
      profile: "Perfil",
    },
    profile: {
      title: "Perfil",
      subtitle: "Tu cuenta y preferencias",
      user: "Usuario",
      myBookings: "Mis reservas",
      account: "Cuenta",
      settings: "Ajustes",
      language: "Idioma",
      session: "Sesión",
      logOut: "Cerrar sesión",
      languageEnglish: "English",
      languageSpanish: "Español",
    },
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
