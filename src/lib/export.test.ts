import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportTransactionsToCSV } from "./export";
import type { Transaction } from "@/types";

describe("exportTransactionsToCSV", () => {
  beforeEach(() => {
    // Mock global objects used for download
    global.URL.createObjectURL = vi.fn(() => "mock-url");
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document.createElement and body methods
    vi.spyOn(document, "createElement");
    vi.spyOn(document.body, "appendChild");
    vi.spyOn(document.body, "removeChild");
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    {
      id: "2",
      description: "Pagamento Aluguel",
      amount: 500,
      type: "expense",
      date: new Date(2026, 3, 11),
      category: "Infra",
    },
  ];

  it("should not trigger download if transactions are empty", () => {
    exportTransactionsToCSV([]);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("should create a download link with CSV content", () => {
    const mockLink = {
      setAttribute: vi.fn(),
      style: { visibility: "" },
      click: vi.fn(),
    } as any;
    
    vi.spyOn(document, "createElement").mockReturnValue(mockLink);

    exportTransactionsToCSV(mockTransactions);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(mockLink.setAttribute).toHaveBeenCalledWith("href", "mock-url");
    expect(mockLink.setAttribute).toHaveBeenCalledWith(
      "download",
      expect.stringContaining("transacoes-piggbank-")
    );
    expect(mockLink.click).toHaveBeenCalled();
  });

  it("should calculate running balance correctly in CSV content", () => {
    // We can't easily check the Blob content in this environment without more complex mocks,
    // but we can verify the logic by checking if it handles the sorted order and balance.
    // For a deeper test, we might need to mock the Blob constructor.
    
    const blobSpy = vi.spyOn(global, "Blob");
    
    exportTransactionsToCSV(mockTransactions);
    
    expect(blobSpy).toHaveBeenCalled();
    const [contentArray] = blobSpy.mock.calls[0];
    const content = (contentArray as any)[0];
    
    // Header
    expect(content).toContain("Data,Descrição,Categoria,Valor,Saldo");
    // First row: 1000 income
    expect(content).toContain("10/04/2026,\"Venda de Produto\",\"Vendas\",1000.00,1000.00");
    // Second row: 500 expense, balance 500
    expect(content).toContain("11/04/2026,\"Pagamento Aluguel\",\"Infra\",-500.00,500.00");
  });

  it("should handle special characters correctly in CSV content (Scenario 3)", () => {
    const transactionsWithSpecialChars: Transaction[] = [
      {
        id: "3",
        description: "Almoço com Equipe",
        amount: 85.5,
        type: "expense",
        date: new Date(2026, 3, 12),
        category: "Refeição",
      },
      {
        id: "4",
        description: "Bônus Março",
        amount: 200,
        type: "income",
        date: new Date(2026, 3, 13),
        category: "Prêmio",
      },
    ];

    const blobSpy = vi.spyOn(global, "Blob");
    exportTransactionsToCSV(transactionsWithSpecialChars);

    expect(blobSpy).toHaveBeenCalled();
    const [contentArray, options] = blobSpy.mock.calls[0];
    const content = (contentArray as any)[0];

    // Check content with special characters
    expect(content).toContain("12/04/2026,\"Almoço com Equipe\",\"Refeição\",-85.50,-85.50");
    expect(content).toContain("13/04/2026,\"Bônus Março\",\"Prêmio\",200.00,114.50");
    
    // Check for UTF-8 charset in options
    expect(options).toEqual({ type: "text/csv;charset=utf-8;" });
  });
});
