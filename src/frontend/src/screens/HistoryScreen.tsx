import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Filter as FilterIcon,
  HandCoins,
  RefreshCw,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { TransactionStatus, TransactionType } from "../backend.d";
import type { Transaction } from "../backend.d";
import { useGetTransactions } from "../hooks/useQueries";
import { formatDateTime } from "../utils/time";

interface HistoryScreenProps {
  onBack: () => void;
}

function getTypeIcon(type: string) {
  switch (type) {
    case TransactionType.send:
      return <ArrowUpRight className="w-5 h-5 text-rose-500" />;
    case TransactionType.receive:
      return <ArrowDownLeft className="w-5 h-5 text-emerald-500" />;
    case TransactionType.bill:
      return <FileText className="w-5 h-5 text-amber-500" />;
    case TransactionType.request:
      return <HandCoins className="w-5 h-5 text-violet-500" />;
    default:
      return <RefreshCw className="w-5 h-5 text-muted-foreground" />;
  }
}

function getTypeBg(type: string) {
  switch (type) {
    case TransactionType.send:
      return "bg-rose-50";
    case TransactionType.receive:
      return "bg-emerald-50";
    case TransactionType.bill:
      return "bg-amber-50";
    case TransactionType.request:
      return "bg-violet-50";
    default:
      return "bg-muted";
  }
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    [TransactionStatus.completed]:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    [TransactionStatus.pending]: "bg-amber-100 text-amber-700 border-amber-200",
    [TransactionStatus.failed]: "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${classes[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status}
    </span>
  );
}

const FILTERS = ["All", "Send", "Receive", "Bills", "Request"] as const;
type TxFilter = (typeof FILTERS)[number];

function matchFilter(tx: Transaction, filter: TxFilter): boolean {
  if (filter === "All") return true;
  if (filter === "Send") return tx.type === TransactionType.send;
  if (filter === "Receive") return tx.type === TransactionType.receive;
  if (filter === "Bills") return tx.type === TransactionType.bill;
  if (filter === "Request") return tx.type === TransactionType.request;
  return true;
}

export default function HistoryScreen({ onBack }: HistoryScreenProps) {
  const { data: transactions, isLoading } = useGetTransactions();
  const [activeFilter, setActiveFilter] = useState<TxFilter>("All");
  const [search, setSearch] = useState("");

  const sorted = [...(transactions ?? [])].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  const filtered = sorted.filter((tx) => {
    if (!matchFilter(tx, activeFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.note.toLowerCase().includes(q) ||
        tx.provider.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q) ||
        tx.status.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen page-content no-scrollbar">
      {/* Header */}
      <div className="px-5 pt-12 pb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-card shadow-card flex items-center justify-center"
        >
          <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
        </button>
        <h1 className="font-display font-bold text-xl text-foreground flex-1">
          Transaction History
        </h1>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full font-medium">
          {filtered.length} txns
        </span>
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-5 space-y-2 pb-6">
        {isLoading ? (
          Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
            <div
              key={key}
              className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card"
            >
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FilterIcon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground">
              No transactions found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different filter or search term
            </p>
          </div>
        ) : (
          filtered.map((tx, i) => (
            <motion.div
              key={tx.id.toString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-card"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeBg(tx.type)}`}
              >
                {getTypeIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {tx.note ||
                      (tx.type === TransactionType.bill
                        ? tx.provider
                        : tx.type)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={tx.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(tx.timestamp)}
                  </span>
                </div>
                {tx.type === TransactionType.bill && tx.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tx.category}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p
                  className={`text-sm font-bold ${
                    tx.type === TransactionType.receive
                      ? "text-emerald-600"
                      : "text-foreground"
                  }`}
                >
                  {tx.type === TransactionType.receive ? "+" : "-"}₹
                  {tx.amount.toLocaleString("en-IN")}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
