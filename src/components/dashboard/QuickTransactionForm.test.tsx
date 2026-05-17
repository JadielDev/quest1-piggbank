import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuickTransactionForm } from "./QuickTransactionForm";

describe("QuickTransactionForm", () => {
  it("renders all form fields and the submit button", () => {
    render(<QuickTransactionForm onAdd={vi.fn()} />);

    expect(screen.getByLabelText(/Tipo/i)).toBeTruthy();
    expect(screen.getByLabelText(/Valor/i)).toBeTruthy();
    expect(screen.getByLabelText(/Descrição/i)).toBeTruthy();
    expect(screen.getByLabelText(/Categoria/i)).toBeTruthy();
    expect(screen.getByLabelText(/Data/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Adicionar transação/i })).toBeTruthy();
  });

  it("calls onAdd with a normalized transaction payload", () => {
    const onAdd = vi.fn();
    render(<QuickTransactionForm onAdd={onAdd} />);

    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "income" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex: 2500/i), {
      target: { value: "2500" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Cliente, compra ou serviço/i), {
      target: { value: "Venda rápida" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ex: Serviços/i), {
      target: { value: "Serviços" },
    });
    fireEvent.change(screen.getByLabelText(/Data/i), {
      target: { value: "2026-05-15" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Adicionar transação/i }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Venda rápida",
        amount: 2500,
        type: "income",
        category: "Serviços",
        date: expect.any(Date),
      }),
    );
  });
});
