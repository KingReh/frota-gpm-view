import { ReactNode } from "react";
import { Header } from "./Header";
import { DrivingTipsToast } from "@/components/ui/DrivingTipsToast";
import { FabMenu } from "@/components/frota/FabMenu";

interface DashboardLayoutProps {
    children: ReactNode;
    viewMode: "table" | "card" | "carousel";
    setViewMode: (mode: "table" | "card" | "carousel") => void;
    isSynced?: boolean;
    lastUpdated?: Date | null;
    recentlyUpdated?: boolean;
}

export const DashboardLayout = ({
    children,
    viewMode,
    setViewMode,
    isSynced,
    lastUpdated,
    recentlyUpdated
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
                <FabMenu />

                <main className="pt-20 px-2 md:px-4 lg:px-8 pb-12 max-w-[1920px] mx-auto animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
};
