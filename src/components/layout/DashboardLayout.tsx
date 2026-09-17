import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DrivingTipsToast } from "@/components/ui/DrivingTipsToast";
import { EndOfMonthAlert } from "@/components/ui/EndOfMonthAlert";
import { FabMenu } from "@/components/frota/FabMenu";
import { SmoothScrollContainer } from "./SmoothScrollContainer";
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
        <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Ambient Background with subtle parallax depth */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div
                    data-speed="0.8"
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/50 via-background to-background will-change-transform"
                />
                {/* Subtle technical depth grid overlay */}
                <div
                    id="background-grid-overlay"
                    data-speed="0.85"
                    className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none will-change-transform"
                />
            </div>

            {/* Fixed Overlays */}
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

            {/* GSAP Smooth Scroll Content Area */}
            <SmoothScrollContainer contentKey={viewMode} className="relative z-10">
                <main className="pt-[calc(60px+env(safe-area-inset-top,0px))] sm:pt-20 pb-12 max-w-[1920px] mx-auto w-full">
                    <EndOfMonthAlert />
                    <div className="px-1 sm:px-2 md:px-4 lg:px-8">
                        {children}
                    </div>
                </main>
                <Footer />
            </SmoothScrollContainer>
        </div>
    );
};

