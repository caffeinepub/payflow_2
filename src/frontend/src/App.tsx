import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import AddMoneyScreen from "./screens/AddMoneyScreen";
import HistoryScreen from "./screens/HistoryScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import PayBillsScreen from "./screens/PayBillsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import QRScanScreen from "./screens/QRScanScreen";
import RegisterScreen from "./screens/RegisterScreen";
import RequestMoneyScreen from "./screens/RequestMoneyScreen";
import SendMoneyScreen from "./screens/SendMoneyScreen";

export type Screen =
  | "home"
  | "send"
  | "request"
  | "add-money"
  | "bills"
  | "history"
  | "profile"
  | "qr-scan";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const [activeScreen, setActiveScreen] = useState<Screen>("home");
  const [qrPrefillUpi, setQrPrefillUpi] = useState<string>("");

  const handleQrScanResult = (upiId: string) => {
    setQrPrefillUpi(upiId);
    setActiveScreen("send");
  };

  // Loading splash
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div className="phone-frame bg-background flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl balance-card-gradient flex items-center justify-center shadow-glow animate-pulse-ring">
            <img
              src="/assets/generated/payflow-logo-transparent.dim_120x120.png"
              alt="PayFlow"
              className="w-10 h-10 object-contain"
            />
          </div>
          <p className="font-display font-semibold text-lg text-foreground">
            PayFlow
          </p>
          <div className="w-24 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full w-full bg-primary rounded-full animate-shimmer"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, oklch(0.45 0.21 270) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" />
        <LoginScreen />
      </>
    );
  }

  // Logged in but no profile
  const showRegister = isAuthenticated && isFetched && userProfile === null;
  if (showRegister) {
    return (
      <>
        <Toaster position="top-center" />
        <RegisterScreen />
      </>
    );
  }

  const navScreens: Screen[] = ["home", "send", "history", "profile"];
  const showBottomNav =
    navScreens.includes(activeScreen) ||
    ["add-money", "bills", "request", "qr-scan"].includes(activeScreen);

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="phone-frame dot-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {activeScreen === "home" && (
              <HomeScreen
                onNavigate={setActiveScreen}
                userProfile={userProfile}
              />
            )}
            {activeScreen === "send" && (
              <SendMoneyScreen
                onBack={() => setActiveScreen("home")}
                prefillUpi={qrPrefillUpi}
                onClearPrefill={() => setQrPrefillUpi("")}
              />
            )}
            {activeScreen === "request" && (
              <RequestMoneyScreen onBack={() => setActiveScreen("home")} />
            )}
            {activeScreen === "add-money" && (
              <AddMoneyScreen onBack={() => setActiveScreen("home")} />
            )}
            {activeScreen === "bills" && (
              <PayBillsScreen onBack={() => setActiveScreen("home")} />
            )}
            {activeScreen === "history" && (
              <HistoryScreen onBack={() => setActiveScreen("home")} />
            )}
            {activeScreen === "profile" && (
              <ProfileScreen
                onNavigate={setActiveScreen}
                userProfile={userProfile}
              />
            )}
            {activeScreen === "qr-scan" && (
              <QRScanScreen
                onBack={() => setActiveScreen("home")}
                onScanResult={handleQrScanResult}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {showBottomNav && (
          <BottomNav active={activeScreen} onNavigate={setActiveScreen} />
        )}
      </div>
    </>
  );
}
