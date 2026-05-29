"use client"

import * as React from "react";
import { computeMetrics } from "@/lib/metrics";
import type { Transaction } from "@/types";
import { MetricsCard } from "./MetricsCard";
import { NewTransactionModal } from "./NewTransactionModal";
import { ExportButton } from "./ExportButton";
import { Button } from "@/components/ui/button";
import { TransactionsTable } from "./TransactionsTable";

type DashboardClientProps = {
  initialTransactions: Transaction[];
};

export function DashboardClient({ initialTransactions }: DashboardClientProps) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(
    initialTransactions,
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const metrics = React.useMemo(
    () => computeMetrics(transactions),
    [transactions],
  );

  const handleAddTransaction = React.useCallback(
    (transaction: Omit<Transaction, "id">) => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setTransactions((current) => [
        { ...transaction, id },
        ...current,
      ]);
    },
    [],
  );

  return (
    <div className="space-y-8">
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Gerenciamento de Transações</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione novas transações ou exporte seus dados para análise externa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton transactions={transactions} />
          <Button onClick={() => setIsModalOpen(true)}>Nova transação</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <MetricsCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-base font-medium text-foreground">
          Transações recentes
        </h2>
        <TransactionsTable transactions={transactions} />
      </div>
    </div>
  );
}
