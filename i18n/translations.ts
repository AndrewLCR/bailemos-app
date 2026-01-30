export type Locale = "en" | "es";

export const translations = {
  en: {
    tabs: {
      home: "Home",
      nearby: "Nearby",
      book: "Book",
      profile: "Profile",
    },
    login: {
      title: "¡Bailemos!",
      email: "Email",
      password: "Password",
      emailPlaceholder: "email@example.com",
      passwordPlaceholder: "Password",
      signIn: "Sign In",
      noAccount: "Don't have an account? ",
      register: "Register",
      errorTitle: "Error",
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
    login: {
      title: "¡Bailemos!",
      email: "Correo electrónico",
      password: "Contraseña",
      emailPlaceholder: "correo@ejemplo.com",
      passwordPlaceholder: "Contraseña",
      signIn: "Iniciar sesión",
      noAccount: "¿No tienes cuenta? ",
      register: "Registrarse",
      errorTitle: "Error",
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
