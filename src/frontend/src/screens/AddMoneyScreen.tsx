import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  CreditCard,
  Loader2,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useTopUp } from "../hooks/useQueries";

interface AddMoneyScreenProps {
  onBack: () => void;
}

const presets = [100, 500, 1000, 2000, 5000, 10000];

const paymentMethods = [
  { id: "upi", label: "UPI", icon: Wallet, desc: "Instant via UPI" },
  {
    id: "card",
    label: "Debit Card",
    icon: CreditCard,
    desc: "Visa / Mastercard",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: Building2,
    desc: "All major banks",
  },
];

type Step = "input" | "success";

export default function AddMoneyScreen({ onBack }: AddMoneyScreenProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [step, setStep] = useState<Step>("input");

  const topUp = useTopUp();

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (Number(amount) < 10) {
      toast.error("Minimum top-up is ₹10");
      return;
    }

    try {
      await topUp.mutateAsync(Number(amount));
      setStep("success");
    } catch {
      toast.error("Transaction failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen page-content no-scrollbar">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-card shadow-card flex items-center justify-center"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>
        <h1 className="font-display font-bold text-xl text-foreground">
          Add Money
        </h1>
      </div>

      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleAddMoney}
              className="space-y-6"
            >
              {/* Amount input */}
              <div className="bg-card rounded-2xl shadow-card p-5 space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground">
                  Enter Amount
                </Label>
                <div className="flex items-center justify-center gap-2 py-2">
                  <span className="font-display font-bold text-4xl text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="font-display font-bold text-5xl text-foreground text-center bg-transparent outline-none w-48 placeholder:text-muted-foreground/40"
                    inputMode="numeric"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setAmount(String(p))}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                        amount === String(p)
                          ? "bg-primary text-primary-foreground border-primary shadow-glow scale-[1.02]"
                          : "bg-secondary border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      +₹{p >= 1000 ? `${p / 1000}K` : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Payment Method</Label>
                <div className="space-y-2">
                  {paymentMethods.map(({ id, label, icon: Icon, desc }) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setMethod(id)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                        method === id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${method === id ? "bg-primary/15" : "bg-muted"}`}
                      >
                        <Icon
                          className={`w-5 h-5 ${method === id ? "text-brand-indigo" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="text-left flex-1">
                        <p
                          className={`text-sm font-semibold ${method === id ? "text-brand-indigo" : "text-foreground"}`}
                        >
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${method === id ? "border-primary bg-primary" : "border-border"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={topUp.isPending || !amount || Number(amount) <= 0}
                className="w-full h-14 rounded-2xl balance-card-gradient text-white text-base font-semibold shadow-glow border-0 hover:opacity-90"
              >
                {topUp.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Processing…
                  </>
                ) : (
                  `Add ₹${amount ? Number(amount).toLocaleString("en-IN") : "0"} to Wallet`
                )}
              </Button>
            </motion.form>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 space-y-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </motion.div>
              <div className="text-center">
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Money Added!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  ₹{Number(amount).toLocaleString("en-IN")} added to your wallet
                </p>
              </div>
              <div className="w-full space-y-3 pt-4">
                <Button
                  onClick={() => {
                    setStep("input");
                    setAmount("");
                  }}
                  className="w-full h-13 rounded-2xl balance-card-gradient text-white font-semibold border-0"
                >
                  Add More Money
                </Button>
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full h-12 rounded-xl"
                >
                  Go to Home
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
