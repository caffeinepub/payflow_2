import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FileText,
  HandCoins,
  Plus,
  QrCode,
  Receipt,
  RefreshCw,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Screen } from "../App";
import type { Transaction, UserProfile } from "../backend.d";
import { TransactionStatus, TransactionType } from "../backend.d";
import { useGetBalance, useGetTransactions } from "../hooks/useQueries";
import { formatDistanceToNow } from "../utils/time";

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  userProfile: UserProfile | null | undefined;
}

const quickActions = [
  {
    screen: "send" as Screen,
    icon: Send,
    label: "Send",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    screen: "request" as Screen,
    icon: HandCoins,
    label: "Request",
    color: "bg-violet-100 text-violet-600",
  },
  {
    screen: "qr-scan" as Screen,
    icon: QrCode,
    label: "Scan & Pay",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    screen: "add-money" as Screen,
    icon: Plus,
    label: "Add Money",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    screen: "bills" as Screen,
    icon: Receipt,
    label: "Pay Bills",
    color: "bg-amber-100 text-amber-600",
  },
  {
    screen: "history" as Screen,
    icon: Clock,
    label: "History",
    color: "bg-rose-100 text-rose-600",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getTransactionIcon(type: string) {
  switch (type) {
    case TransactionType.send:
      return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
    case TransactionType.receive:
      return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
    case TransactionType.bill:
      return <FileText className="w-4 h-4 text-amber-500" />;
    case TransactionType.request:
      return <HandCoins className="w-4 h-4 text-violet-500" />;
    default:
      return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
  }
}

function statusColor(status: string) {
  switch (status) {
    case TransactionStatus.completed:
      return "text-emerald-600";
    case TransactionStatus.pending:
      return "text-amber-600";
    case TransactionStatus.failed:
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

function amountColor(type: string) {
  return type === TransactionType.receive
    ? "text-emerald-600"
    : "text-foreground";
}

function amountPrefix(type: string) {
  return type === TransactionType.receive ? "+" : "-";
}

export default function HomeScreen({
  onNavigate,
  userProfile,
}: HomeScreenProps) {
  const { data: balance, isLoading: balanceLoading } = useGetBalance();
  const { data: transactions, isLoading: txLoading } = useGetTransactions();
  const [balanceVisible, setBalanceVisible] = useState(true);

  const recentTx: Transaction[] = (transactions ?? [])
    .slice()
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 5);

  const firstName = userProfile?.name?.split(" ")[0] ?? "User";

  return (
    <div className="flex flex-col min-h-screen page-content no-scrollbar">
      {/* Header */}
      <div className="px-5 pt-12 pb-2 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs text-muted-foreground font-medium">
            {getGreeting()},
          </p>
          <h2 className="font-display font-bold text-xl text-foreground">
            {firstName} 👋
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center relative"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
          </button>
        </motion.div>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="mx-5 mt-4 mb-5"
      >
        <div className="balance-card-gradient rounded-3xl p-6 shadow-glow relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 bg-white" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p className="text-white/70 text-sm font-medium">Total Balance</p>
              <button
                type="button"
                onClick={() => setBalanceVisible((v) => !v)}
                className="text-white/70 hover:text-white transition-colors"
                aria-label={balanceVisible ? "Hide balance" : "Show balance"}
              >
                {balanceVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>

            {balanceLoading ? (
              <Skeleton className="h-10 w-36 bg-white/20 rounded-xl mt-1" />
            ) : (
              <p className="font-display font-bold text-4xl text-white tracking-tight">
                {balanceVisible
                  ? `₹${(balance ?? 0).toLocaleString("en-IN")}`
                  : "₹ ••••••"}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">UPI ID</p>
                <p className="text-white text-sm font-medium">
                  {userProfile?.upiId ?? "—"}
                </p>
              </div>
              <div className="bg-white/20 rounded-xl px-3 py-1.5">
                <p className="text-white text-xs font-semibold">Active</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="px-5 mb-5"
      >
        <h3 className="font-display font-semibold text-sm text-foreground mb-3 tracking-wide uppercase text-xs text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ screen, icon: Icon, label, color }, i) => (
            <motion.button
              key={screen}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.22 + i * 0.05, duration: 0.3 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onNavigate(screen)}
              className="flex flex-col items-center gap-2 bg-card rounded-2xl p-3.5 shadow-card hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground text-center leading-tight">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="px-5 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-foreground">
            Recent Activity
          </h3>
          <button
            type="button"
            onClick={() => onNavigate("history")}
            className="flex items-center gap-1 text-xs text-brand-indigo font-medium"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {txLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentTx.length === 0 ? (
            <div className="py-10 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm font-medium text-muted-foreground">
                No transactions yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                Send or receive money to get started
              </p>
            </div>
          ) : (
            <div>
              {recentTx.map((tx, i) => (
                <div
                  key={tx.id.toString()}
                  className={`flex items-center gap-3 px-4 py-3.5 ${i < recentTx.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tx.note ||
                        (tx.type === TransactionType.bill
                          ? tx.provider
                          : tx.type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(tx.timestamp)} ·{" "}
                      <span className={statusColor(tx.status)}>
                        {tx.status}
                      </span>
                    </p>
                  </div>
                  <p
                    className={`text-sm font-bold flex-shrink-0 ${amountColor(tx.type)}`}
                  >
                    {amountPrefix(tx.type)}₹{tx.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <div className="px-5 pb-4 text-center">
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
