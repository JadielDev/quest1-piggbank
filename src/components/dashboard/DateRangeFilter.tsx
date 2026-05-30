"use client"

import * as React from "react"
import type { DateRange as DayPickerDateRange } from "react-day-picker"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { DateRange } from "@/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  formatDisplayDate,
  formatUrlDate,
  isValidDateRange,
  isDateInFuture,
  exceedsMaxRange,
} from "@/lib/date"

type DateRangeFilterProps = {
  initialRange: DateRange
}

export function DateRangeFilter({ initialRange }: DateRangeFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [draftRange, setDraftRange] = React.useState<DayPickerDateRange | undefined>(
    initialRange,
  )
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setDraftRange(initialRange)
  }, [initialRange])

  const selectedRange: DateRange | undefined =
    draftRange?.from && draftRange.to
      ? { from: draftRange.from, to: draftRange.to }
      : undefined

  const validationMessage = React.useMemo(() => {
    if (!selectedRange) {
      return "Selecione um intervalo completo."
    }

    if (!isValidDateRange(selectedRange)) {
      return "Data de término deve ser igual ou posterior à data de início."
    }

    if (exceedsMaxRange(selectedRange)) {
      return "Intervalo máximo é de 12 meses."
    }

    if (isDateInFuture(selectedRange.to)) {
      return "Datas no futuro não são permitidas."
    }

    return undefined
  }, [selectedRange])

  const hasValidRange = selectedRange !== undefined && validationMessage === undefined

  const rangeLabel = selectedRange
    ? `${formatDisplayDate(selectedRange.from)} – ${formatDisplayDate(selectedRange.to)}`
    : `${formatDisplayDate(initialRange.from)} – ${formatDisplayDate(initialRange.to)}`

  const handleApply = React.useCallback(() => {
    if (!hasValidRange || !selectedRange) {
      return
    }

    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set("from", formatUrlDate(selectedRange.from))
    params.set("to", formatUrlDate(selectedRange.to))

    router.replace(`${pathname}?${params.toString()}`)
    setIsOpen(false)
  }, [selectedRange, hasValidRange, pathname, router, searchParams])

  const handleCancel = React.useCallback(() => {
    setDraftRange(initialRange)
    setIsOpen(false)
  }, [initialRange])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger variant="outline" size="lg" className="h-9">
        {rangeLabel}
      </PopoverTrigger>
      <PopoverContent side="bottom" sideOffset={4} className="w-[min(420px,100vw)]">
        <Calendar
          mode="range"
          selected={draftRange}
          onSelect={(value) =>
            setDraftRange(
              value && value.from && value.to
                ? { from: value.from, to: value.to }
                : undefined,
            )
          }
          defaultMonth={initialRange.from}
        />
        {validationMessage ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {validationMessage}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button size="sm" disabled={!hasValidRange} onClick={handleApply}>
            Aplicar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
