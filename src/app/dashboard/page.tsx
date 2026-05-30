import { Suspense } from "react"
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getTransactions } from "@/lib/api";
import { getDateRangeFromQuery, getDefaultDateRange } from "@/lib/date";
import type { DateRange } from "@/types";

type SearchParams = Record<string, string | string[] | undefined>;

type DashboardPageProps = {
  searchParams?: SearchParams;
};

function normalizeQueryParam(value?: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const dateRange: DateRange =
    getDateRangeFromQuery({
      from: normalizeQueryParam(searchParams?.from),
      to: normalizeQueryParam(searchParams?.to),
    }) ?? getDefaultDateRange();

  const filters = { dateRange };
  const transactions = await getTransactions(filters);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
          <span className="text-lg font-semibold text-foreground">
            🐷 piggbank
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            BH
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl space-y-8 px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Visão Geral
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Métricas financeiras do período
            </p>
          </div>
          <Suspense fallback={<div className="h-9 w-40" />}>
            <DateRangeFilter initialRange={dateRange} />
          </Suspense>
        </div>

        <DashboardClient initialTransactions={transactions} />
      </main>
    </div>
  );
}
