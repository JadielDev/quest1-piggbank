import { Transaction } from "@/types";
import { formatDisplayDate } from "./date";

/**
 * Exports an array of transactions to a CSV file.
 * The CSV includes: Data, Descrição, Categoria, Valor, Saldo.
 */
export function exportTransactionsToCSV(transactions: Transaction[]) {
  if (transactions.length === 0) return;

  // Sort by date to ensure the running balance makes sense
  const sortedTransactions = [...transactions].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const headers = ["Data", "Descrição", "Categoria", "Valor", "Saldo"];
  
  let runningBalance = 0;
  const rows = sortedTransactions.map((t) => {
    const amount = t.type === "income" ? t.amount : -t.amount;
    runningBalance += amount;
    
    return [
      formatDisplayDate(t.date),
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes and wrap in quotes
      `"${t.category.replace(/"/g, '""')}"`,
      amount.toFixed(2),
      runningBalance.toFixed(2),
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  const timestamp = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `transacoes-piggbank-${timestamp}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
