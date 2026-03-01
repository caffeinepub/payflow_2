import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Droplets,
  Flame,
  Loader2,
  Smartphone,
  Tv,
  Wifi,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { usePayBill } from "../hooks/useQueries";

interface PayBillsScreenProps {
  onBack: () => void;
}

const categories = [
  {
    id: "Mobile Recharge",
    label: "Mobile Recharge",
    icon: Smartphone,
    color: "bg-indigo-100 text-indigo-600",
    providers: ["Jio", "Airtel", "Vi", "BSNL"],
  },
  {
    id: "Electricity",
    label: "Electricity",
    icon: Zap,
    color: "bg-amber-100 text-amber-600",
    providers: ["TATA Power", "Adani Electricity", "BESCOM", "MSEDCL"],
  },
  {
    id: "DTH",
    label: "DTH / Cable TV",
    icon: Tv,
    color: "bg-violet-100 text-violet-600",
    providers: ["Tata Sky", "Dish TV", "Airtel DTH", "Sun Direct"],
  },
  {
    id: "Water Bill",
    label: "Water Bill",
    icon: Droplets,
    color: "bg-cyan-100 text-cyan-600",
    providers: ["Municipal Corporation", "Water Board"],
  },
  {
    id: "Gas",
    label: "Gas / LPG",
    icon: Flame,
    color: "bg-orange-100 text-orange-600",
    providers: ["HP Gas", "Indane", "Bharat Gas"],
  },
  {
    id: "Broadband",
    label: "Broadband",
    icon: Wifi,
    color: "bg-emerald-100 text-emerald-600",
    providers: ["ACT Fibernet", "Jio Fiber", "Airtel Fiber", "BSNL Fiber"],
  },
];

type Step = "categories" | "form" | "success";

export default function PayBillsScreen({ onBack }: PayBillsScreenProps) {
  const [step, setStep] = useState<Step>("categories");
  const [selectedCategory, setSelectedCategory] = useState<
    (typeof categories)[0] | null
  >(null);
  const [provider, setProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");

  const payBill = usePayBill();

  const handleSelectCategory = (cat: (typeof categories)[0]) => {
    setSelectedCategory(cat);
    setProvider("");
    setAccountNumber("");
    setAmount("");
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim()) {
      toast.error("Please enter provider name");
      return;
    }
    if (!accountNumber.trim()) {
      toast.error("Please enter account/number");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await payBill.mutateAsync({
        category: selectedCategory!.id,
        provider: provider.trim(),
        accountNumber: accountNumber.trim(),
        amount: Number(amount),
      });
      setStep("success");
    } catch {
      toast.error("Bill payment failed. Please try again.");
    }
  };

  const accountLabel =
    selectedCategory?.id === "Mobile Recharge"
      ? "Mobile Number"
      : selectedCategory?.id === "DTH"
        ? "Customer ID"
        : "Account Number";

  return (
    <div className="flex flex-col min-h-screen page-content no-scrollbar">
      <div className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={step === "form" ? () => setStep("categories") : onBack}
          className="w-9 h-9 rounded-xl bg-card shadow-card flex items-center justify-center"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>
        <h1 className="font-display font-bold text-xl text-foreground">
          {step === "form" ? selectedCategory?.label : "Pay Bills"}
        </h1>
      </div>

      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          {step === "categories" && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Choose a bill category to pay
              </p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(({ id, label, icon: Icon, color }) => (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      handleSelectCategory(categories.find((c) => c.id === id)!)
                    }
                    className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card hover:shadow-lg transition-shadow text-left"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-tight">
                        {label}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "form" && selectedCategory && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Category pill */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${selectedCategory.color}`}
              >
                <selectedCategory.icon className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {selectedCategory.label}
                </span>
              </div>

              {/* Provider */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  Provider / Operator
                </Label>
                <Input
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder={`e.g. ${selectedCategory.providers[0]}`}
                  className="h-13 rounded-xl text-base"
                  list={`providers-${selectedCategory.id}`}
                />
                <datalist id={`providers-${selectedCategory.id}`}>
                  {selectedCategory.providers.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">{accountLabel}</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={
                    selectedCategory.id === "Mobile Recharge"
                      ? "9876543210"
                      : "Enter account number"
                  }
                  className="h-13 rounded-xl text-base"
                  inputMode={
                    selectedCategory.id === "Mobile Recharge"
                      ? "numeric"
                      : "text"
                  }
                />
              </div>

              <div className="space-y-1.5">
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
              </div>

              <Button
                type="submit"
                disabled={payBill.isPending}
                className="w-full h-14 rounded-2xl balance-card-gradient text-white text-base font-semibold shadow-glow border-0 hover:opacity-90"
              >
                {payBill.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Processing…
                  </>
                ) : (
                  `Pay ₹${amount ? Number(amount).toLocaleString("en-IN") : "0"}`
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
                  Bill Paid!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {selectedCategory?.label} — ₹
                  {Number(amount).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {provider} · {accountNumber}
                </p>
              </div>
              <div className="w-full space-y-3 pt-4">
                <Button
                  onClick={() => setStep("categories")}
                  className="w-full h-13 rounded-2xl balance-card-gradient text-white font-semibold border-0"
                >
                  Pay Another Bill
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
