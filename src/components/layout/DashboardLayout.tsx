import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DrivingTipsToast } from "@/components/ui/DrivingTipsToast";
import { EndOfMonthAlert } from "@/components/ui/EndOfMonthAlert";
import { FabMenu } from "@/components/frota/FabMenu";
import type { VehicleWithDetails, Coordination } from "@/types/vehicle";

interface DashboardLayoutProps {
    children: ReactNode;
    viewMode: "table" | "card" | "carousel";
    setViewMode: (mode: "table" | "card" | "carousel") => void;
    isSynced?: boolean;
    lastUpdated?: Date | null;
    recentlyUpdated?: boolean;
    vehicles?: VehicleWithDetails[];
    coordinations?: Coordination[];
    selectedCoordinations?: string[];
}

export const DashboardLayout = ({
    children,
    viewMode,
    setViewMode,
    isSynced,
    lastUpdated,
    recentlyUpdated,
    vehicles = [],
    coordinations = [],
    selectedCoordinations = [],
}: DashboardLayoutProps) => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Header
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isSynced={isSynced}
                    lastUpdated={lastUpdated}
                    recentlyUpdated={recentlyUpdated}
                />

                <DrivingTipsToast />
                <FabMenu
                    vehicles={vehicles}
                    coordinations={coordinations}
                    selectedCoordinations={selectedCoordinations}
                />

                <main className="pt-[calc(60px+env(safe-area-inset-top,0px))] sm:pt-20 pb-12 max-w-[1920px] mx-auto animate-in fade-in zoom-in-95 duration-500">
                    <EndOfMonthAlert />
                    <div className="px-1 sm:px-2 md:px-4 lg:px-8">
                    {children}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};
