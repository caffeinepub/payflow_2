import { Button } from "@/components/ui/button";
import { Loader2, Lock, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const features = [
  {
    icon: Shield,
    label: "Bank-grade Security",
    desc: "End-to-end encrypted transactions",
  },
  {
    icon: Zap,
    label: "Instant Transfers",
    desc: "Send & receive money in seconds",
  },
  {
    icon: TrendingUp,
    label: "Smart Payments",
    desc: "Bills, recharges & more in one app",
  },
];

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="phone-frame min-h-screen flex flex-col relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 dot-bg" />
      <div
        className="absolute top-0 left-0 right-0 h-72 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 120% 60% at 50% 0%, oklch(0.45 0.21 270), transparent)",
        }}
      />

      {/* Hero section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="mb-6"
        >
          <div className="w-20 h-20 rounded-3xl balance-card-gradient flex items-center justify-center shadow-glow">
            <img
              src="/assets/generated/payflow-logo-transparent.dim_120x120.png"
              alt="PayFlow"
              className="w-12 h-12 object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="text-center mb-10"
        >
          <h1 className="font-display font-bold text-4xl text-foreground tracking-tight mb-2">
            Pay<span className="text-brand-indigo">Flow</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Your complete digital payment wallet
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="w-full space-y-3 mb-10"
        >
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3.5 bg-card rounded-2xl px-4 py-3.5 shadow-card"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-brand-indigo" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.45 }}
          className="w-full space-y-3"
        >
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-14 text-base font-semibold rounded-2xl balance-card-gradient text-white shadow-glow hover:opacity-90 transition-opacity border-0"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Login Securely
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Powered by Internet Identity — no passwords needed
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="relative pb-8 text-center">
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
