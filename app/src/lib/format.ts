export type Currency = 'NGN' | 'USD'

export const currencySymbol: Record<Currency, string> = {
  NGN: '₦',
  USD: '$',
}

/** Full money string, e.g. ₦12,400,000 or $1,204.50 */
export function money(amount: number, currency: Currency = 'NGN'): string {
  const decimals = currency === 'USD' ? 2 : 0
  return (
    currencySymbol[currency] +
    amount.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  )
}

/** Compact money, e.g. ₦96.9K or $1.2M */
export function compactMoney(amount: number, currency: Currency = 'NGN'): string {
  return (
    currencySymbol[currency] +
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  )
}

export function num(value: number, maxFractionDigits = 2): string {
  return value.toLocaleString('en-US', { maximumFractionDigits: maxFractionDigits })
}

export function compact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** 0x1cf2…9a56 style truncation */
export function shortAddr(addr: string): string {
  if (addr.length <= 11) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function maskId(value: string): string {
  if (!value) return ''
  const last4 = value.slice(-4)
  return `•••• •••• ${last4}`
}
