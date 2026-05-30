import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ExportButton } from "./ExportButton";
import * as exportLib from "@/lib/export";
import type { Transaction } from "@/types";

// Mock the export library
vi.mock("@/lib/export", () => ({
  exportTransactionsToCSV: vi.fn(),
}));

describe("ExportButton", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      description: "Venda de Produto",
      amount: 1000,
      type: "income",
      date: new Date(2026, 3, 10),
      category: "Vendas",
    },
  ];

  it("should render the export button", () => {
    render(<ExportButton transactions={[]} />);
    expect(screen.getByRole("button", { name: /Exportar para CSV/i })).toBeTruthy();
  });

  it("should be disabled if transactions are empty (Scenario 2)", () => {
    render(<ExportButton transactions={[]} />);
    const button = screen.getByRole("button", { name: /Exportar para CSV/i });
    expect(button).toBeDisabled();
  });

  it("should be enabled if transactions are present", () => {
    render(<ExportButton transactions={mockTransactions} />);
    const button = screen.getByRole("button", { name: /Exportar para CSV/i });
    expect(button).not.toBeDisabled();
  });

  it("should call export function and show loading state when clicked (Scenario 1)", async () => {
    render(<ExportButton transactions={mockTransactions} />);
    const button = screen.getByRole("button", { name: /Exportar para CSV/i });
    
    fireEvent.click(button);

    // Check loading state immediately after click
    expect(button).toBeDisabled();
    expect(screen.getByText(/Exportando\.\.\./i)).toBeTruthy();

    // Wait for the simulated delay (500ms) and the export function call
    await waitFor(() => {
      expect(exportLib.exportTransactionsToCSV).toHaveBeenCalledWith(mockTransactions);
    }, { timeout: 1000 });

    // Check if it returns to idle state
    await waitFor(() => {
      expect(button).not.toBeDisabled();
      expect(screen.getByText(/Exportar CSV/i)).toBeTruthy();
    });
  });

  it("should show error message if export fails", async () => {
    vi.spyOn(exportLib, "exportTransactionsToCSV").mockImplementation(() => {
      throw new Error("Export failed");
    });

    render(<ExportButton transactions={mockTransactions} />);
    const button = screen.getByRole("button", { name: /Exportar para CSV/i });
    
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao exportar arquivo\. Tente novamente\./i)).toBeTruthy();
    }, { timeout: 1000 });

    expect(button).not.toBeDisabled();
  });
});
