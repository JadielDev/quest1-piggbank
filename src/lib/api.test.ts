import { describe, it, expect } from "vitest";
import { getTransactions, getMetrics } from "./api";
import { mockTransactions } from "@/data/mock";
import type { DashboardFilters } from "@/types";

const fullYearFilters: DashboardFilters = {
  dateRange: {
    from: new Date(2026, 0, 1),
    to: new Date(2026, 11, 31, 23, 59, 59),
  },
};

const aprilFilters: DashboardFilters = {
  dateRange: {
    from: new Date(2026, 3, 1),
    to: new Date(2026, 3, 30, 23, 59, 59),
  },
};

describe("getTransactions", () => {
  it("returns all transactions within a wide range", async () => {
    const result = await getTransactions(fullYearFilters);
    expect(result).toEqual(mockTransactions);
  });

  it("filters transactions by the selected date range", async () => {
    const result = await getTransactions(aprilFilters);
    expect(result.map((transaction) => transaction.id)).toEqual(["1", "2", "3", "4"]);
  });

  it("returns an array", async () => {
    const result = await getTransactions(fullYearFilters);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getMetrics", () => {
  it("returns 4 metrics", async () => {
    const result = await getMetrics(fullYearFilters);
    expect(result).toHaveLength(4);
  });

  it("returns metrics with expected labels", async () => {
    const result = await getMetrics(fullYearFilters);
    const labels = result.map((m) => m.label);
    expect(labels).toContain("Faturamento");
    expect(labels).toContain("Despesas");
    expect(labels).toContain("Lucro Líquido");
    expect(labels).toContain("Transações");
  });

  it("derives revenue from the filtered transactions", async () => {
    const transactions = await getTransactions(aprilFilters);
    const expectedRevenue = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const metrics = await getMetrics(aprilFilters);
    expect(metrics.find((m) => m.label === "Faturamento")!.value).toBe(expectedRevenue);
  });

  it("derives transaction count from filtered transactions", async () => {
    const transactions = await getTransactions(aprilFilters);
    const metrics = await getMetrics(aprilFilters);
    expect(metrics.find((m) => m.label === "Transações")!.value).toBe(transactions.length);
  });
});
