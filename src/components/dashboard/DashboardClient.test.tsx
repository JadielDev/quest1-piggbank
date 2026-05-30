import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DashboardClient } from "./DashboardClient";
import type { Transaction } from "@/types";

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: "1",
  description: "Assinatura cliente Acme Corp",
  amount: 12000,
  type: "income",
  date: new Date("2026-04-10"),
  category: "Assinatura",
  ...overrides,
});

describe("DashboardClient", () => {
  it("renders metrics and transaction table from initial transactions", () => {
    render(<DashboardClient initialTransactions={[makeTransaction()]} />);

    expect(screen.getByText(/Faturamento/i)).toBeTruthy();
    expect(screen.getAllByText(/Transações/i)).toHaveLength(2);
    expect(screen.getByText(/Assinatura cliente Acme Corp/i)).toBeTruthy();
  });

  it("opens the modal and adds a new transaction", () => {
    render(<DashboardClient initialTransactions={[makeTransaction()]} />);

    const [modalTrigger] = screen.getAllByRole("button", { name: /Nova transação/i });
    fireEvent.click(modalTrigger);

    fireEvent.change(screen.getByLabelText(/Tipo/i), {
      target: { value: "expense" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex: 2500/i), {
      target: { value: "1500" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Cliente, compra ou serviço/i), {
      target: { value: "Compra de material" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex: Serviços/i), {
      target: { value: "Software" },
    });
    fireEvent.change(screen.getByLabelText(/Data/i), {
      target: { value: "2026-05-15" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

    expect(screen.getByText(/Compra de material/i)).toBeTruthy();
    expect(screen.getByText(/Software/i)).toBeTruthy();
  });
});
