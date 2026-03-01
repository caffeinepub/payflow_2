import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  ScanLine,
  Send,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useGetUserByPhone,
  useGetUserByUpi,
  useSendMoney,
} from "../hooks/useQueries";

interface SendMoneyScreenProps {
  onBack: () => void;
  prefillUpi?: string;
  onClearPrefill?: () => void;
}

type Step = "input" | "confirm" | "success";

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

export default function SendMoneyScreen({
  onBack,
  prefillUpi,
  onClearPrefill,
}: SendMoneyScreenProps) {
  const [recipient, setRecipient] = useState(prefillUpi ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<Step>("input");

  const sendMoney = useSendMoney();

  // Check if input looks like phone
  const isPhone = /^\d{10}$/.test(recipient);
  const isUpi = recipient.includes("@");
  const lookupUpi = isUpi ? recipient : "";
  const lookupPhone = isPhone ? recipient : "";

  const { data: userByUpi } = useGetUserByUpi(lookupUpi);
  const { data: userByPhone } = useGetUserByPhone(lookupPhone);
  const recipientUser = userByUpi ?? userByPhone;

  useEffect(() => {
    if (prefillUpi) {
      setRecipient(prefillUpi);
      onClearPrefill?.();
    }
  }, [prefillUpi, onClearPrefill]);

  const resolvedUpi = isUpi ? recipient : (recipientUser?.upiId ?? "");

  const handleConfirm = () => {
    if (!resolvedUpi) {
      toast.error("Please enter a valid UPI ID or phone number");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setStep("confirm");
  };

  const handleSend = async () => {
    try {
      await sendMoney.mutateAsync({
        receiverUpi: resolvedUpi,
        amount: Number(amount),
        note,
      });
      setStep("success");
    } catch {
      toast.error("Payment failed. Please try again.");
      setStep("input");
    }
  };

  const handleReset = () => {
    setRecipient("");
    setAmount("");
    setNote("");
    setStep("input");
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
          Send Money
        </h1>
      </div>

      <div className="flex-1 px-5">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {/* Recipient */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  To (UPI ID or Phone)
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="name@payflow or 9876543210"
                    className="pl-10 h-13 rounded-xl text-base"
                  />
                </div>
                {recipientUser && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-700">
                        {recipientUser.name}
                      </p>
                      <p className="text-xs text-emerald-600">
                        {recipientUser.upiId}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Amount */}
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
                    className="pl-8 h-16 rounded-xl text-3xl font-bold text-foreground text-center"
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

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Note (optional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lunch split, rent, etc."
                  className="h-12 rounded-xl text-sm"
                />
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full h-14 rounded-2xl balance-card-gradient text-white text-base font-semibold shadow-glow border-0 hover:opacity-90"
              >
                <Send className="mr-2 h-5 w-5" />
                Proceed to Pay
              </Button>
            </motion.div>
          )}

          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              <div className="bg-card rounded-2xl shadow-card p-5 space-y-4">
                <h2 className="font-display font-bold text-lg text-foreground text-center">
                  Confirm Payment
                </h2>

                <div className="balance-card-gradient rounded-2xl p-5 text-center">
                  <p className="text-white/70 text-sm mb-1">You are sending</p>
                  <p className="font-display font-bold text-4xl text-white">
                    ₹{Number(amount).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-semibold text-foreground">
                      {recipientUser?.name ?? resolvedUpi}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">UPI ID</span>
                    <span className="font-medium text-foreground">
                      {resolvedUpi}
                    </span>
                  </div>
                  {note && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium text-foreground">
                        {note}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSend}
                  disabled={sendMoney.isPending}
                  className="w-full h-14 rounded-2xl balance-card-gradient text-white text-base font-semibold shadow-glow border-0 hover:opacity-90"
                >
                  {sendMoney.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending…
                    </>
                  ) : (
                    `Confirm & Send ₹${Number(amount).toLocaleString("en-IN")}`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("input")}
                  className="w-full h-12 rounded-xl"
                >
                  Edit Details
                </Button>
              </div>
            </motion.div>
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
                  Payment Sent!
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  ₹{Number(amount).toLocaleString("en-IN")} sent successfully
                </p>
              </div>
              <div className="w-full space-y-3 pt-4">
                <Button
                  onClick={handleReset}
                  className="w-full h-13 rounded-2xl balance-card-gradient text-white font-semibold border-0"
                >
                  Send Another Payment
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

      <div className="px-5 py-4 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <ScanLine className="w-3 h-3" /> All transactions are secured &
          encrypted
        </p>
      </div>
    </div>
  );
}
