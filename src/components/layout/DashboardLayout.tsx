import { ReactNode } from "react";
import { Header } from "./Header";
import { DrivingTipsToast } from "@/components/ui/DrivingTipsToast";

interface DashboardLayoutProps {
    children: ReactNode;
    viewMode: "table" | "card" | "carousel";
    setViewMode: (mode: "table" | "card" | "carousel") => void;
    isSynced?: boolean;
    lastUpdated?: Date | null;
}

export const DashboardLayout = ({
    children,
    viewMode,
    setViewMode,
    isSynced,
    lastUpdated
}: DashboardLayoutProps) => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/90 via-background to-background" />
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px] animate-pulse delay-700" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Header
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isSynced={isSynced}
                    lastUpdated={lastUpdated}
                />

                <DrivingTipsToast />

                <main className="pt-20 px-2 md:px-4 lg:px-8 pb-12 max-w-[1920px] mx-auto animate-in fade-in zoom-in-95 duration-500">
                    {children}
                </main>
            </div>
        </div>
    );
};
