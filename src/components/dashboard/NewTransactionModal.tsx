"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { QuickTransactionForm } from "./QuickTransactionForm"
import type { Transaction } from "@/types"

type NewTransactionModalProps = {
  isOpen: boolean
  onClose: () => void
  onAdd: (transaction: Omit<Transaction, "id">) => void
}

export function NewTransactionModal({ isOpen, onClose, onAdd }: NewTransactionModalProps) {
  const titleId = React.useId()

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-foreground">
              Nova transação
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Preencha o valor, a categoria e a data para atualizar o fluxo.
            </p>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar modal">
            ✕
          </Button>
        </div>

        <QuickTransactionForm
          onAdd={(transaction) => {
            onAdd(transaction)
            onClose()
          }}
          hideHeader
          submitLabel="Salvar"
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
