import { useEffect, useState } from "react";
import {
  Monitor,
  Moon,
  Sun,
  Database,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Laptop,
  Palette,
} from "lucide-react";

const STORAGE_KEY = "motomate-settings";

const DEFAULT_SETTINGS = {
  theme: "light",
  distanceUnit: "km",
  dateFormat: "DD/MM/YYYY",
};

const THEME_OPTIONS = [
  {
    value: "light",
    label: "Light",
    description: "Clean and bright",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Premium midnight",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Follow your device",
    icon: Monitor,
  },
];

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};

    return {
      theme: ["light", "dark", "system"].includes(parsed.theme)
        ? parsed.theme
        : DEFAULT_SETTINGS.theme,

      distanceUnit: ["km", "miles"].includes(parsed.distanceUnit)
        ? parsed.distanceUnit
        : DEFAULT_SETTINGS.distanceUnit,

      dateFormat: [
        "DD/MM/YYYY",
        "MM/DD/YYYY",
        "YYYY-MM-DD",
      ].includes(parsed.dateFormat)
        ? parsed.dateFormat
        : DEFAULT_SETTINGS.dateFormat,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function getEffectiveTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return theme;
}

function applyTheme(theme) {
  const effectiveTheme = getEffectiveTheme(theme);
  const root = document.documentElement;

  root.classList.toggle("dark", effectiveTheme === "dark");
  root.dataset.theme = effectiveTheme;
  root.dataset.themePreference = theme;
  root.style.colorScheme = effectiveTheme;
}

function initializeSettings() {
  const initialSettings = loadSettings();

  // Apply the saved theme immediately during initialization.
  if (typeof window !== "undefined") {
    applyTheme(initialSettings.theme);
  }

  return initialSettings;
}

function SettingSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors duration-300 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
          <Icon size={20} strokeWidth={1.8} />
        </div>

        <div>
          <h2 className="font-semibold tracking-tight text-foreground">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function PreferenceRow({ title, description, children }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="sm:w-56 sm:shrink-0">{children}</div>
    </div>
  );
}

const selectClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-3 text-sm text-foreground outline-none transition-colors focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/15";

export default function Settings() {
  const [settings, setSettings] = useState(initializeSettings);
  const [saved, setSaved] = useState(false);

  // Apply the selected theme whenever it changes.
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Follow operating-system theme changes in System mode.
  useEffect(() => {
    if (settings.theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => applyTheme("system");

    media.addEventListener("change", updateTheme);

    return () => {
      media.removeEventListener("change", updateTheme);
    };
  }, [settings.theme]);

  function updateSetting(key, value) {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      applyTheme(settings.theme);
      setSaved(true);
    } catch {
      window.alert(
        "Settings could not be saved. Please check your browser storage."
      );
    }
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Reset all MotoMate preferences to their default values?"
    );

    if (!confirmed) return;

    const defaults = { ...DEFAULT_SETTINGS };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      setSettings(defaults);
      applyTheme(defaults.theme);
      setSaved(true);
    } catch {
      window.alert("Unable to reset settings in browser storage.");
    }
  }

  const effectiveTheme = getEffectiveTheme(settings.theme);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      {/* Page heading */}
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-800 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-300">
          <Sparkles size={13} />
          PERSONALISE YOUR WORKSPACE
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Make MotoMate feel right for you. Manage appearance and regional
          preferences.
        </p>
      </div>

      {/* Appearance */}
      <SettingSection
        icon={Palette}
        title="Appearance"
        description="Customise how MotoMate looks on this device."
      >
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">
              Display theme
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {THEME_OPTIONS.map(
                ({ value, label, description, icon: Icon }) => {
                  const active = settings.theme === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => updateSetting("theme", value)}
                      className={`group relative flex min-h-28 flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#111C2E] ${
                        active
                          ? "border-cyan-500 bg-cyan-50/80 shadow-sm ring-1 ring-cyan-500/20 dark:border-cyan-400/70 dark:bg-cyan-400/[0.08] dark:ring-cyan-400/20"
                          : "border-border bg-card hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div
                          className={`rounded-xl p-2.5 transition-colors ${
                            active
                              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon size={19} strokeWidth={1.8} />
                        </div>

                        {active && (
                          <CheckCircle2
                            size={18}
                            className="text-cyan-600 dark:text-cyan-300"
                          />
                        )}
                      </div>

                      <span className="mt-3 text-sm font-semibold text-foreground">
                        {label}
                      </span>

                      <span className="mt-1 text-xs text-muted-foreground">
                        {description}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Active theme information */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4">
            <div className="mt-0.5 text-cyan-700 dark:text-cyan-300">
              {settings.theme === "system" ? (
                <Laptop size={19} />
              ) : settings.theme === "dark" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-foreground">
                {settings.theme === "system"
                  ? "Following your device"
                  : settings.theme === "dark"
                    ? "Dark appearance selected"
                    : "Light appearance selected"}
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {settings.theme === "system"
                  ? `Your device is currently using ${effectiveTheme} appearance. MotoMate will switch automatically when your device theme changes.`
                  : settings.theme === "dark"
                    ? "A deep navy workspace with soft cyan highlights and comfortable contrast."
                    : "A bright, clean workspace with subtle borders and clear typography."}
              </p>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Data and privacy */}
      <SettingSection
        icon={Database}
        title="Data & privacy"
        description="Understand how your application data is stored."
      >
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-card p-2 text-muted-foreground">
              <Database size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">
                Local application setup
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Motorcycle and maintenance records are managed by your Flask
                backend and SQLite database. Your preferences are stored
                separately in this browser and do not modify your motorcycle
                records.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Clearing browser storage may remove saved preferences. Database
          backup and recovery are not available from this page.
        </p>
      </SettingSection>

      {/* Actions */}
      <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={resetSettings}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
        >
          <RotateCcw size={16} />
          Reset preferences
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {saved && (
            <span
              role="status"
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"
            >
              <CheckCircle2 size={16} />
              Preferences saved
            </span>
          )}

          <button
            type="button"
            onClick={saveSettings}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 dark:focus-visible:ring-offset-[#0B1220]"
          >
            <CheckCircle2 size={16} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
