
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import Stats from "@/components/dashboard/Stats";
import Garage from "@/components/dashboard/Garage";
import Attention from "@/components/dashboard/Attention";
import History from "@/components/dashboard/History";
import MotorcycleForm from "@/components/dashboard/MotorcycleForm";
import MaintenanceForm from "@/components/dashboard/MaintenanceForm";
import MaintenanceHistory from "@/components/dashboard/MaintenanceHistory";
import Settings from "@/components/dashboard/Settings";

import useMotoMate from "@/hooks/useMotoMate";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    activePage,
    setActivePage,
    motorcycles,
    maintenanceRecords,
    failedBikeIds,
    editingMotorcycle,
    setEditingMotorcycle,
    editingMaintenance,
    setEditingMaintenance,
    savingMotorcycle,
    savingMaintenance,
    loading,
    error,
    overdueCount,
    dueSoonCount,
    handleCreateMotorcycle,
    handleUpdateMotorcycle,
    handleDeleteMotorcycle,
    handleCreateMaintenance,
    handleUpdateMaintenance,
    handleDeleteMaintenance,
  } = useMotoMate();

  function openEditMotorcycle(bike) {
    setEditingMotorcycle(bike);
    setActivePage("Edit Motorcycle");
  }

  function openAddMaintenance() {
    setEditingMaintenance(null);
    setActivePage("Add Maintenance");
  }

  function openEditMaintenance(record) {
    setEditingMaintenance(record);
    setActivePage("Edit Maintenance");
  }

  function pageContent() {
    switch (activePage) {
      case "Add Motorcycle":
        return (
          <MotorcycleForm
            onSubmit={handleCreateMotorcycle}
            saving={savingMotorcycle}
            onCancel={() => setActivePage("My Motorcycles")}
          />
        );

      case "Edit Motorcycle":
        return (
          <MotorcycleForm
            key={editingMotorcycle?.id ?? "edit-motorcycle"}
            motorcycle={editingMotorcycle}
            onSubmit={handleUpdateMotorcycle}
            saving={savingMotorcycle}
            onCancel={() => {
              setEditingMotorcycle(null);
              setActivePage("My Motorcycles");
            }}
          />
        );

      case "My Motorcycles":
        return (
          <Garage
            motorcycles={motorcycles}
            maintenanceRecords={maintenanceRecords}
            failedBikeIds={failedBikeIds}
            loading={loading}
            searchQuery={searchQuery}
            setActivePage={setActivePage}
            onEditMotorcycle={openEditMotorcycle}
            onDeleteMotorcycle={handleDeleteMotorcycle}
          />
        );

      case "Maintenance History":
        return (
          <MaintenanceHistory
            records={maintenanceRecords}
            loading={loading}
            onAddRecord={openAddMaintenance}
            onEditRecord={openEditMaintenance}
            onDeleteRecord={handleDeleteMaintenance}
          />
        );

      case "Add Maintenance":
        return (
          <MaintenanceForm
            motorcycles={motorcycles}
            onSubmit={handleCreateMaintenance}
            saving={savingMaintenance}
            onCancel={() => setActivePage("Maintenance History")}
          />
        );

      case "Edit Maintenance":
        return (
          <MaintenanceForm
            key={editingMaintenance?.id ?? "edit-maintenance"}
            motorcycles={motorcycles}
            record={editingMaintenance}
            onSubmit={handleUpdateMaintenance}
            saving={savingMaintenance}
            onCancel={() => {
              setEditingMaintenance(null);
              setActivePage("Maintenance History");
            }}
          />
        );

      case "Service Schedule":
        return (
          <Attention
            records={maintenanceRecords}
            loading={loading}
            failedBikeIds={failedBikeIds}
            setActivePage={setActivePage}
          />
        );

      case "Settings":
        return <Settings />;

      default:
        return (
          <>
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <AlertTriangle
                  size={20}
                  className="mt-0.5 shrink-0"
                />
                <div>
                  <p className="font-semibold">
                    Unable to load dashboard data
                  </p>
                  <p className="mt-1">{error}</p>
                  <p className="mt-1">
                    Make sure the Flask backend is running at{" "}
                    http://127.0.0.1:5000.
                  </p>
                </div>
              </div>
            )}

            {failedBikeIds.length > 0 && !error && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
              >
                Some motorcycle service statuses could not be loaded.
                The dashboard may not show every maintenance reminder.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stats
                title="My Motorcycles"
                value={loading ? "—" : motorcycles.length}
                description="Registered motorcycles"
                icon="bike"
                trend="Your garage"
                trendType="neutral"
              />

              <Stats
                title="Maintenance Records"
                value={loading ? "—" : maintenanceRecords.length}
                description="Recorded services"
                icon="wrench"
                trend="Service history"
                trendType="neutral"
              />

              <Stats
                title="Overdue Services"
                value={loading ? "—" : overdueCount}
                description="Require attention"
                icon="help"
                trend={
                  overdueCount > 0
                    ? "Needs attention"
                    : "No overdue services"
                }
                trendType={overdueCount > 0 ? "down" : "neutral"}
              />

              <Stats
                title="Due Soon"
                value={loading ? "—" : dueSoonCount}
                description="Within 500 km"
                icon="clock"
                trend={
                  dueSoonCount > 0
                    ? "Plan your service"
                    : "No upcoming services"
                }
                trendType={dueSoonCount > 0 ? "up" : "neutral"}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Garage
                motorcycles={motorcycles}
                maintenanceRecords={maintenanceRecords}
                failedBikeIds={failedBikeIds}
                loading={loading}
                searchQuery={searchQuery}
                setActivePage={setActivePage}
                onEditMotorcycle={openEditMotorcycle}
                onDeleteMotorcycle={handleDeleteMotorcycle}
              />

              <Attention
                records={maintenanceRecords}
                loading={loading}
                failedBikeIds={failedBikeIds}
                setActivePage={setActivePage}
              />
            </div>

            <div className="mt-6">
              <History
                records={maintenanceRecords}
                loading={loading}
                setActivePage={setActivePage}
              />
            </div>
          </>
        );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        overdueCount={overdueCount}
      />

      <div className="min-h-screen lg:pl-64">
        <Header
          activePage={activePage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setMobileMenuOpen={setMobileMenuOpen}
          overdueCount={overdueCount}
          setActivePage={setActivePage}
        />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {pageContent()}
        </main>

        <footer className="border-t border-slate-200 px-6 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} MotoMate. Motorcycle maintenance made easier.
        </footer>
      </div>
    </div>
  );
}
