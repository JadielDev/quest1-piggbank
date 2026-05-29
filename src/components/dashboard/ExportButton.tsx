"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportTransactionsToCSV } from "@/lib/export";
import type { Transaction } from "@/types";

type ExportButtonProps = {
  transactions: Transaction[];
};

export function ExportButton({ transactions }: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleExport = async () => {
    if (transactions.length === 0) return;

    setIsExporting(true);
    setError(null);

    try {
      // Simulate a small delay for better UX (feedback)
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      exportTransactionsToCSV(transactions);
    } catch (err) {
      console.error("Failed to export:", err);
      setError("Erro ao exportar arquivo. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="outline"
        onClick={handleExport}
        disabled={transactions.length === 0 || isExporting}
        className="flex items-center gap-2"
        aria-label="Exportar para CSV"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "Exportando..." : "Exportar CSV"}
      </Button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
