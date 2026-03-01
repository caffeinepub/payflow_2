import { Clock, Home, Send, User } from "lucide-react";
import { motion } from "motion/react";
import type { Screen } from "../App";

interface BottomNavProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const navItems: {
  screen: Screen;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { screen: "home", icon: Home, label: "Home" },
  { screen: "send", icon: Send, label: "Send" },
  { screen: "history", icon: Clock, label: "History" },
  { screen: "profile", icon: User, label: "Profile" },
];

export default function BottomNav({ active, onNavigate }: BottomNavProps) {
  const isNavActive = (screen: Screen) => {
    if (
      screen === "home" &&
      ["home", "add-money", "bills", "request", "qr-scan"].includes(active)
    )
      return true;
    return active === screen;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-md border-t border-border shadow-nav z-50">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {navItems.map(({ screen, icon: Icon, label }) => {
          const isActive = isNavActive(screen);
          return (
            <button
              type="button"
              key={screen}
              onClick={() => onNavigate(screen)}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors relative min-w-[60px]"
              aria-label={label}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-brand-indigo" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-brand-indigo font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
