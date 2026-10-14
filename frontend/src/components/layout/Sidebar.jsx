import {
  ArrowRight,
  Bike,
  CalendarDays,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import motomateLogo from "../../assets/motomate-logo.png";

const navigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Motorcycles",
    icon: Bike,
  },
  {
    label: "Maintenance History",
    icon: Wrench,
  },
  {
    label: "Service Schedule",
    icon: CalendarDays,
  },
];

export default function Sidebar({
  activePage,
  setActivePage,
  mobileMenuOpen,
  setMobileMenuOpen,
  overdueCount = 0,
}) {
  function navigateTo(page) {
    setActivePage(page);
    setMobileMenuOpen(false);
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-slate-950/65 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-hidden border-r border-slate-700/50 bg-gradient-to-b from-[#102238] via-[#0c1a2d] to-[#091321] text-slate-100 shadow-[12px_0_40px_rgba(2,8,23,0.18)] transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Decorative background accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/[0.07] blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-teal-400/[0.05] blur-3xl"
        />

        {/* Brand */}
        <div className="relative flex h-20 shrink-0 items-center gap-3 px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            <img
              src={motomateLogo}
              alt="MotoMate Logo"
              className="h-11 w-11 rounded-[calc(var(--radius)+4px)] object-contain"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-white">
              MotoMate
            </h1>

            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-400">
              MOTORCYCLE CARE
            </p>
          </div>
        </div>

        {/* Brand separator */}
        <div className="relative px-5">
          <Separator className="bg-gradient-to-r from-cyan-300/30 via-slate-600/60 to-transparent" />
        </div>

        {/* Navigation */}
        <div className="relative px-3.5 pt-7">
          <div className="mb-3 flex items-center justify-between px-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>

            <span className="h-1.5 w-1.5 rounded-full bg-teal-400/80 shadow-[0_0_8px_rgba(45,212,191,0.45)]" />
          </div>

          <nav aria-label="Main navigation" className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => navigateTo(item.label)}
                  className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1a2d] ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-300 to-teal-300 text-slate-950 shadow-[0_4px_18px_rgba(34,211,238,0.13)]"
                      : "text-slate-400 hover:bg-white/[0.055] hover:text-slate-100"
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-white/80"
                    />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive
                        ? "text-slate-950"
                        : "text-slate-500 group-hover:scale-105 group-hover:text-cyan-300"
                    }`}
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  {item.label === "Service Schedule" &&
                    overdueCount > 0 && (
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                          isActive
                            ? "bg-red-600 text-white"
                            : "border border-red-400/20 bg-red-500/15 text-red-300"
                        }`}
                      >
                        {overdueCount}
                      </span>
                    )}

                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-slate-950/70"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="relative mt-auto space-y-4 p-3.5">
          {/* Maintenance reminder card */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-[#162d43] to-[#102236] p-4 shadow-lg shadow-black/10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full bg-cyan-300/[0.08] blur-2xl"
            />

            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-300">
                  <ShieldCheck size={19} strokeWidth={1.8} />
                </div>

                <span className="rounded-full border border-teal-300/15 bg-teal-300/[0.08] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-teal-300">
                  Ride safe
                </span>
              </div>

              <h2 className="text-sm font-semibold tracking-tight text-white">
                Keep your bike safe
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                Stay on top of maintenance and keep your motorcycle road-ready.
              </p>

              <button
                type="button"
                onClick={() => navigateTo("Service Schedule")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg text-xs font-semibold text-cyan-300 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                View service schedule
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div>
            <Separator className="mb-3 bg-slate-700/60" />

            <button
              type="button"
              aria-current={activePage === "Settings" ? "page" : undefined}
              onClick={() => navigateTo("Settings")}
              className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                activePage === "Settings"
                  ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                  : "border-transparent text-slate-400 hover:border-slate-700/70 hover:bg-white/[0.04] hover:text-slate-100"
              }`}
            >
              <Settings
                size={19}
                strokeWidth={1.8}
                className={`transition-transform duration-300 ${
                  activePage === "Settings"
                    ? "text-cyan-300"
                    : "text-slate-500 group-hover:rotate-45 group-hover:text-cyan-300"
                }`}
              />

              <span className="flex-1 text-left">Settings</span>

              {activePage === "Settings" && (
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 px-3 pb-1">
            <Bike size={13} className="text-slate-600" />

            <p className="text-[10px] font-medium tracking-wide text-slate-500">
              MotoMate
              <span className="mx-1.5 text-slate-700">·</span>
              Motorcycle Care
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
