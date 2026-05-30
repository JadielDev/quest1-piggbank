"use client"

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types";

const categoryOptions = [
  "Assinatura",
  "Infraestrutura",
  "Serviços",
  "Software",
  "Projeto",
  "RH",
  "Outros",
];

const formatDateForInput = (date: Date): string => format(date, "yyyy-MM-dd");

const getDefaultDateValue = (): string => formatDateForInput(new Date());

type QuickTransactionFormProps = {
  onAdd: (transaction: Omit<Transaction, "id">) => void;
  title?: string;
  submitLabel?: string;
  hideHeader?: boolean;
  onCancel?: () => void;
};

export function QuickTransactionForm({
  onAdd,
  title = "Adicionar nova transação",
  submitLabel = "Adicionar transação",
  hideHeader = false,
  onCancel,
}: QuickTransactionFormProps) {
  const [type, setType] = React.useState<Transaction["type"]>("expense");
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState(categoryOptions[0]);
  const [date, setDate] = React.useState(getDefaultDateValue());

  const amountValue = React.useMemo(() => Number(amount), [amount]);
  const canSubmit =
    description.trim().length > 0 &&
    !Number.isNaN(amountValue) &&
    amountValue > 0 &&
    category.trim().length > 0 &&
    date.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onAdd({
      description: description.trim(),
      amount: amountValue,
      type,
      date: new Date(date),
      category: category.trim(),
    });

    setDescription("");
    setAmount("");
    setCategory(categoryOptions[0]);
    setDate(getDefaultDateValue());
  };

  return (
    <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
      {!hideHeader ? (
        <div className="mb-4">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adicione receita ou despesa rapidamente para manter seu fluxo de caixa atualizado.
          </p>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-foreground">
            Tipo
            <select
              value={type}
              onChange={(event) => setType(event.target.value as Transaction["type"])}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </label>

          <label className="space-y-1 text-sm text-foreground">
            Valor
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Ex: 2500"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm text-foreground">
          Descrição
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Cliente, compra ou serviço"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-foreground">
            Categoria
            <input
              type="text"
              list="transaction-category-options"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Ex: Serviços"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <datalist id="transaction-category-options">
              {categoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>

          <label className="space-y-1 text-sm text-foreground">
            Data
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              max={formatDateForInput(new Date())}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" disabled={!canSubmit}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </section>
  );
}
