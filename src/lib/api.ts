import { mockTransactions } from "@/data/mock";
import { computeMetrics } from "@/lib/metrics";
import { isInDateRange } from "@/lib/date";
import type { DashboardFilters, MetricSummary, Transaction } from "@/types";

export async function getTransactions(
  filters: DashboardFilters,
): Promise<Transaction[]> {
  return mockTransactions.filter((transaction) =>
    isInDateRange(transaction.date, filters.dateRange),
  );
}

export async function getMetrics(
  filters: DashboardFilters,
): Promise<MetricSummary[]> {
  const transactions = await getTransactions(filters);
  return computeMetrics(transactions);
}
