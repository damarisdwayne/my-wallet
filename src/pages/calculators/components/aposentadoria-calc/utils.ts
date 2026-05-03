export type RowEntry = { label: string; totalInvested: number; balance: number; earnings: number }

export const buildMonthlyRows = (PV: number, PMT: number, rMonthly: number, n: number): RowEntry[] => {
  let balance = PV
  return Array.from({ length: n }, (_, i) => {
    balance = balance * (1 + rMonthly) + PMT
    const invested = PV + PMT * (i + 1)
    return {
      label: `${i + 1}º mês`,
      totalInvested: invested,
      balance,
      earnings: balance - invested,
    }
  })
}

export const buildYearlyRows = (PV: number, PMT: number, rMonthly: number, n: number): RowEntry[] => {
  let balance = PV
  const totalYears = Math.ceil(n / 12)
  return Array.from({ length: totalYears }, (_, i) => {
    const monthsThisYear = i < totalYears - 1 ? 12 : n - i * 12
    for (let m = 0; m < monthsThisYear; m++) balance = balance * (1 + rMonthly) + PMT
    const yearMonths = Math.min((i + 1) * 12, n)
    const invested = PV + PMT * yearMonths
    return {
      label: `${i + 1}º ano`,
      totalInvested: invested,
      balance,
      earnings: balance - invested,
    }
  })
}
