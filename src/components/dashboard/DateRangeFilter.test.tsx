import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { DateRangeFilter } from "./DateRangeFilter"
import type { DateRange } from "@/types"

const replaceMock = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams("from=2026-03-01&to=2026-03-15"),
}))

describe("DateRangeFilter", () => {
  const initialRange: DateRange = {
    from: new Date(2026, 2, 1),
    to: new Date(2026, 2, 15),
  }

  beforeEach(() => {
    replaceMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it("renders the selected date range label", () => {
    render(<DateRangeFilter initialRange={initialRange} />)

    expect(
      screen.getByRole("button", {
        name: /01\/03\/2026\s+–\s+15\/03\/2026/,
      }),
    ).toBeTruthy()
  })

  it("opens the popover when the range button is clicked", async () => {
    render(<DateRangeFilter initialRange={initialRange} />)

    const triggerButton = screen.getAllByRole("button", {
      name: /01\/03\/2026\s+–\s+15\/03\/2026/,
    })[0]

    fireEvent.click(triggerButton)

    expect(await screen.findByRole("button", { name: /Aplicar/ })).toBeTruthy()
    expect(await screen.findByRole("button", { name: /Cancelar/ })).toBeTruthy()
  })

  it("calls router.replace with query params when apply is clicked", async () => {
    render(<DateRangeFilter initialRange={initialRange} />)

    const triggerButton = screen.getAllByRole("button", {
      name: /01\/03\/2026\s+–\s+15\/03\/2026/,
    })[0]

    fireEvent.click(triggerButton)
    const applyButton = await screen.findByRole("button", { name: /Aplicar/ })

    fireEvent.click(applyButton)

    expect(replaceMock).toHaveBeenCalledWith("/dashboard?from=2026-03-01&to=2026-03-15")
  })

  it("shows a validation message for invalid ranges", async () => {
    const invalidRange: DateRange = {
      from: new Date(2026, 2, 15),
      to: new Date(2026, 2, 1),
    }

    render(<DateRangeFilter initialRange={invalidRange} />)

    const triggerButton = screen.getAllByRole("button", {
      name: /15\/03\/2026\s+–\s+01\/03\/2026/,
    })[0]

    fireEvent.click(triggerButton)

    const alert = await screen.findByRole("alert")
    expect(alert.textContent).toBe("Data de término deve ser igual ou posterior à data de início.")
    expect((await screen.findByRole("button", { name: /Aplicar/ })).disabled).toBe(true)
  })
})
