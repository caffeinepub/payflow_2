import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, HandCoins, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRequestMoney } from "../hooks/useQueries";

interface RequestMoneyScreenProps {
  onBack: () => void;
}

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

type Step = "input" | "success";

export default function RequestMoneyScreen({
  onBack,
}: RequestMoneyScreenProps) {
  const [fromUpi, setFromUpi] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<Step>("input");

  const requestMoney = useRequestMoney();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUpi.trim()) {
      toast.error("Please enter a UPI ID");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await requestMoney.mutateAsync({
        requesterUpi: fromUpi.trim(),
        amount: Number(amount),
        note,
      });
      setStep("success");
    } catch {
      toast.error("Request failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen page-content no-scrollbar">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-card shadow-card flex items-center justify-center"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>
        <h1 className="font-display font-bold text-xl text-foreground">
          Request Money
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
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  Request from (UPI ID)
                </Label>
                <Input
                  value={fromUpi}
                  onChange={(e) => setFromUpi(e.target.value)}
                  placeholder="friend@payflow"
                  className="h-13 rounded-xl text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-bold text-lg">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="pl-8 h-16 rounded-xl text-3xl font-bold text-center"
                    inputMode="numeric"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickAmounts.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => setAmount(String(a))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        amount === String(a)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      ₹{a.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Note (optional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="For dinner, trip, etc."
                  className="h-12 rounded-xl text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={requestMoney.isPending}
                className="w-full h-14 rounded-2xl balance-card-gradient text-white text-base font-semibold shadow-glow border-0 hover:opacity-90"
              >
                {requestMoney.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending
                    Request…
                  </>
                ) : (
                  <>
                    <HandCoins className="mr-2 h-5 w-5" /> Send Request
                  </>
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
                className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-violet-600" />
              </motion.div>
              <div className="text-center">
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Request Sent!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  ₹{Number(amount).toLocaleString("en-IN")} requested from{" "}
                  {fromUpi}
                </p>
              </div>
              <div className="w-full space-y-3 pt-4">
                <Button
                  onClick={() => {
                    setStep("input");
                    setFromUpi("");
                    setAmount("");
                    setNote("");
                  }}
                  className="w-full h-13 rounded-2xl balance-card-gradient text-white font-semibold border-0"
                >
                  Send Another Request
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
