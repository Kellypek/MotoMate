
import {
  Activity,
  Bell,
  ChevronDown,
  Menu,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import motomateLogo from "../../assets/motomate-logo.png";

export default function Header({
  activePage,
  searchQuery,
  setSearchQuery,
  setMobileMenuOpen,
  overdueCount = 0,
  setActivePage,
}) {
  const pageDescriptions = {
    Dashboard: "Your motorcycle maintenance overview.",
    "My Motorcycles": "Manage your registered motorcycles.",
    "Maintenance History": "Review your motorcycle service records.",
    "Service Schedule": "Keep track of upcoming and overdue services.",
    Settings: "Manage your MotoMate preferences.",
  };

  return (
    <header className="border-b border-border bg-card text-foreground transition-colors duration-200">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={21} />
          </Button>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {activePage}
            </h2>

            <p className="mt-1 hidden text-sm text-slate-500 sm:block">
              {pageDescriptions[activePage] ||
                "Manage your motorcycle maintenance."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="relative hidden w-48 md:block lg:w-64">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search motorcycles..."
              aria-label="Search motorcycles"
              className="border-slate-200 bg-slate-50 pl-9"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Notifications. ${overdueCount} overdue services`}
            className="relative text-slate-600"
            onClick={() => setActivePage("Service Schedule")}
          >
            <Bell size={20} />

            {overdueCount > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
            )}
          </Button>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <button
            type="button"
            onClick={() => setActivePage("Settings")}
            className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-slate-50"
            aria-label="Open settings"
          >
            
            <img
              src={motomateLogo}
              alt="MotoMate Logo"
              className="h-9 w-9 rounded-xl object-contain"
            />

            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-slate-800">
                MotoMate User
              </p>
              <p className="text-xs text-slate-500">
                Motorcycle Owner
              </p>
            </div>

            <ChevronDown
              size={16}
              className="hidden text-slate-400 lg:block"
            />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 pb-3 text-xs text-slate-400 sm:hidden">
        <Activity size={13} />
        <span>Motorcycle care dashboard</span>
      </div>
    </header>
  );
}
