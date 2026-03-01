import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle,
  ChevronRight,
  Copy,
  CreditCard,
  HelpCircle,
  LogOut,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetBalance } from "../hooks/useQueries";

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void;
  userProfile: UserProfile | null | undefined;
}

export default function ProfileScreen({
  onNavigate: _onNavigate,
  userProfile,
}: ProfileScreenProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: balance } = useGetBalance();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success("Logged out successfully");
  };

  const handleCopyUpi = () => {
    if (userProfile?.upiId) {
      navigator.clipboard.writeText(userProfile.upiId).then(() => {
        setCopied(true);
        toast.success("UPI ID copied!");
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const initials = userProfile?.name
    ? userProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const menuItems = [
    { icon: Bell, label: "Notifications", desc: "Manage alerts" },
    { icon: Shield, label: "Security & Privacy", desc: "PIN, biometrics" },
    { icon: HelpCircle, label: "Help & Support", desc: "FAQs, contact us" },
  ];

  return (
    <div className="flex flex-col min-h-screen page-content no-scrollbar">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-display font-bold text-xl text-foreground">
          Profile
        </h1>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-5 mb-5"
      >
        <div className="balance-card-gradient rounded-3xl p-5 shadow-glow relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10 bg-white" />

          <div className="relative z-10 flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-2xl text-white">
                {initials}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-xl text-white truncate">
                {userProfile?.name ?? "—"}
              </h2>
              <p className="text-white/70 text-sm">
                {userProfile?.phone ?? "—"}
              </p>
              <div className="mt-1 bg-white/15 rounded-lg px-2 py-0.5 inline-block">
                <p className="text-white/90 text-xs font-medium">
                  Balance: ₹{(balance ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* UPI ID card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="mx-5 mb-4"
      >
        <div className="bg-card rounded-2xl shadow-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wide">
            Your UPI ID
          </p>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground text-base">
              {userProfile?.upiId ?? "—"}
            </p>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand-indigo bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/15 transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="mx-5 mb-4"
      >
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm font-semibold text-foreground">
                {userProfile?.name ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Phone Number</p>
              <p className="text-sm font-semibold text-foreground">
                {userProfile?.phone ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Principal ID</p>
              <p className="text-sm font-semibold text-foreground font-mono truncate max-w-[200px]">
                {identity?.getPrincipal().toString().slice(0, 16)}…
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Menu items */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="mx-5 mb-4"
      >
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map(({ icon: Icon, label, desc }, i) => (
            <button
              type="button"
              key={label}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors text-left ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="mx-5 mb-4"
      >
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-13 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/5 font-semibold text-sm"
        >
          <LogOut className="mr-2 h-4 h-4" />
          Logout
        </Button>
      </motion.div>

      {/* Footer */}
      <div className="px-5 pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
