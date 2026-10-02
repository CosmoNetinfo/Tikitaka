import type { Tables } from '@/types/database'

/**
 * Finds the appropriate combo based on the selected components.
 */
export function calculateCombo(
  combos: Tables<'combos'>[],
  hasPrimo: boolean,
  hasSecondo: boolean,
  hasContorno: boolean
): Tables<'combos'> | null {
  // If nothing is selected, no combo applies
  if (!hasPrimo && !hasSecondo && !hasContorno) {
    return null
  }

  // Find exact match
  const match = combos.find(c => 
    c.has_primo === hasPrimo &&
    c.has_secondo === hasSecondo &&
    c.has_contorno === hasContorno &&
    c.is_active
  )
  
  return match || null
}

/**
 * Calculates the total cost of an order including fees.
 */
export function calculateOrderTotal(
  comboPriceCents: number,
  extrasTotalCents: number,
  specialItemsTotalCents: number,
  paymentMethod: 'card' | 'cash',
  cardFeeMode: 'none' | 'fixed' | 'percent',
  cardFeeValue: number
): { subtotal: number, fee: number, total: number } {
  const subtotal = comboPriceCents + extrasTotalCents + specialItemsTotalCents
  let fee = 0

  if (paymentMethod === 'card') {
    if (cardFeeMode === 'fixed') {
      fee = cardFeeValue
    } else if (cardFeeMode === 'percent') {
      // e.g., if cardFeeValue is 2 (for 2%), subtotal * 0.02
      fee = Math.round(subtotal * (cardFeeValue / 100))
    }
  }

  return {
    subtotal,
    fee,
    total: subtotal + fee
  }
}
