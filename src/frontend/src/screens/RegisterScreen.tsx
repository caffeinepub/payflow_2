import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Sparkles, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterUser } from "../hooks/useQueries";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const register = useRegisterUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      await register.mutateAsync({ name: name.trim(), phone });
      toast.success("Welcome to PayFlow! 🎉");
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="phone-frame min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 dot-bg" />
      <div
        className="absolute top-0 left-0 right-0 h-56 opacity-15"
        style={{
          background:
            "radial-gradient(ellipse 120% 70% at 50% 0%, oklch(0.45 0.21 270), transparent)",
        }}
      />

      <div className="relative flex-1 flex flex-col justify-center px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <div className="w-14 h-14 rounded-2xl balance-card-gradient flex items-center justify-center shadow-glow mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-1">
            Welcome to PayFlow
          </h1>
          <p className="text-muted-foreground text-sm">
            Set up your account to get started
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-foreground"
            >
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-13 rounded-xl border-border bg-card text-base"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="phone"
              className="text-sm font-semibold text-foreground"
            >
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="pl-10 h-13 rounded-xl border-border bg-card text-base"
                autoComplete="tel"
                inputMode="numeric"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your UPI ID will be created automatically
            </p>
          </div>

          {name.trim() && (
            <div className="bg-primary/8 rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Your UPI ID will be
              </p>
              <p className="text-sm font-semibold text-brand-indigo">
                {name.trim().toLowerCase().replace(/\s+/g, "")}@payflow
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={register.isPending}
            className="w-full h-13 text-base font-semibold rounded-2xl balance-card-gradient text-white shadow-glow hover:opacity-90 transition-opacity border-0 mt-2"
          >
            {register.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create Account →"
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
