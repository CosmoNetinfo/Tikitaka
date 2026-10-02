import type { Tables } from '@/types/database';

/**
 * Formats cents into Italian currency format: e.g. "15,00 €"
 */
export function formatCurrency(cents: number): string {
  const euros = (cents / 100).toFixed(2).replace('.', ',');
  return `${euros} €`;
}

export type ComboRow = {
  id?: string;
  company_id?: string | null;
  label: string;
  has_primo: boolean;
  has_secondo: boolean;
  has_contorno: boolean;
  price_cents: number;
  is_active?: boolean | null;
};

export const DRINK_EXTRA_PRICE_CENTS = 200; // 2,00 €

/**
 * Standard default combos matching the database table `combos`.
 */
export const DEFAULT_COMBOS: ComboRow[] = [
  {
    id: 'eff2f901-56f0-4242-9ff4-ae188b5ae9f4',
    label: 'Primo + acqua',
    has_primo: true,
    has_secondo: false,
    has_contorno: false,
    price_cents: 600,
    is_active: true
  },
  {
    id: '49c85d76-9b61-4760-a2fd-875fca52f085',
    label: 'Secondo + acqua',
    has_primo: false,
    has_secondo: true,
    has_contorno: false,
    price_cents: 600,
    is_active: true
  },
  {
    id: '1ef3fac8-133f-4763-b45f-b4b90d763948',
    label: 'Secondo + contorno + acqua',
    has_primo: false,
    has_secondo: true,
    has_contorno: true,
    price_cents: 800,
    is_active: true
  },
  {
    id: '8e4ee5cf-9bed-4b4a-8294-6ee8ba31e630',
    label: 'Primo + secondo + acqua',
    has_primo: true,
    has_secondo: true,
    has_contorno: false,
    price_cents: 1000,
    is_active: true
  },
  {
    id: '74638289-8f2c-4e16-a382-802b7be0f009',
    label: 'Primo + secondo + contorno + acqua',
    has_primo: true,
    has_secondo: true,
    has_contorno: true,
    price_cents: 1300,
    is_active: true
  }
];

/**
 * Verifies whether the selected drink is an extra drink (+2 €).
 * Free water ("Acqua", "Acqua Naturale", "Inclusa", or empty) does not add extra cost.
 */
export function isExtraDrink(drink?: string | null): boolean {
  if (!drink) return false;
  const normalized = drink.trim().toLowerCase();
  if (normalized === '' || normalized === 'acqua' || normalized === 'acqua naturale' || normalized === 'inclusa') {
    return false;
  }
  return true;
}

/**
 * Validates whether the combination of primo, secondo, contorno is valid.
 * Returns an error message if invalid, or null if valid.
 * - Solo contorno is rejected
 * - Primo + contorno (without secondo) is rejected
 */
export function validateCombination(
  hasPrimo: boolean,
  hasSecondo: boolean,
  hasContorno: boolean
): { valid: boolean; error?: string } {
  if (hasContorno && !hasPrimo && !hasSecondo) {
    return {
      valid: false,
      error: 'Combinazione non valida: il contorno non può essere ordinato da solo.'
    };
  }

  if (hasPrimo && hasContorno && !hasSecondo) {
    return {
      valid: false,
      error: 'Combinazione non valida: il contorno è disponibile solo con il secondo (non con solo il primo).'
    };
  }

  if (!hasPrimo && !hasSecondo && !hasContorno) {
    return {
      valid: false,
      error: 'Nessun piatto del menu selezionato.'
    };
  }

  return { valid: true };
}

/**
 * Finds the matching combo from the combos table based on the selected components.
 */
export function calculateCombo(
  combos: ComboRow[] | Tables<'combos'>[],
  hasPrimo: boolean,
  hasSecondo: boolean,
  hasContorno: boolean
): ComboRow | Tables<'combos'> | null {
  const validation = validateCombination(hasPrimo, hasSecondo, hasContorno);
  if (!validation.valid) {
    return null;
  }

  const list = combos && combos.length > 0 ? combos : DEFAULT_COMBOS;
  const match = list.find(c => 
    c.has_primo === hasPrimo &&
    c.has_secondo === hasSecondo &&
    c.has_contorno === hasContorno &&
    (c.is_active === undefined || c.is_active === null || c.is_active === true)
  );

  return match || null;
}

export interface CalculateOrderInput {
  combo?: {
    primo_formato?: string | null;
    primo_condimento?: string | null;
    secondo?: string | null;
    contorno?: string | null;
    drink?: string | null;
  };
  special_items?: Array<{
    id: string;
    qty: number;
    unit_price_cents?: number;
    price_cents?: number;
    name?: string;
    dbItem?: { name?: string; price_cents?: number };
  }>;
  combos?: ComboRow[] | Tables<'combos'>[];
  paymentMethod?: 'card' | 'cash';
  cardFeeMode?: 'none' | 'fixed' | 'percent';
  cardFeeValue?: number;
}

export interface OrderTotalResult {
  valid: boolean;
  error?: string;
  combo: ComboRow | Tables<'combos'> | null;
  comboPriceCents: number;
  drinkPriceCents: number;
  specialItemsTotalCents: number;
  subtotal: number;
  subtotal_cents: number;
  fee: number;
  card_fee_cents: number;
  total: number;
  total_cents: number;
  formatted_total: string;
  order_lines: Array<{
    special_item_id?: string;
    name_snapshot: string;
    unit_price_cents: number;
    qty: number;
  }>;
}

/**
 * Calculates the complete order total based on combos table, drinks, and special items.
 * Can be called with an options object (used by API routes and pages) or with positional arguments.
 */
export function calculateOrderTotal(
  inputOrComboPrice: CalculateOrderInput | number,
  extrasTotalCents = 0,
  specialItemsTotalCents = 0,
  paymentMethod: 'card' | 'cash' = 'cash',
  cardFeeMode: 'none' | 'fixed' | 'percent' = 'none',
  cardFeeValue = 0
): OrderTotalResult {
  // If called with positional arguments (legacy compatibility)
  if (typeof inputOrComboPrice === 'number') {
    const comboPriceCents = inputOrComboPrice;
    const subtotal = comboPriceCents + extrasTotalCents + specialItemsTotalCents;
    let fee = 0;
    if (paymentMethod === 'card') {
      if (cardFeeMode === 'fixed') fee = cardFeeValue;
      else if (cardFeeMode === 'percent') fee = Math.round(subtotal * (cardFeeValue / 100));
    }
    const total = subtotal + fee;
    return {
      valid: true,
      combo: null,
      comboPriceCents,
      drinkPriceCents: extrasTotalCents,
      specialItemsTotalCents,
      subtotal,
      subtotal_cents: subtotal,
      fee,
      card_fee_cents: fee,
      total,
      total_cents: total,
      formatted_total: formatCurrency(total),
      order_lines: []
    };
  }

  const {
    combo,
    special_items = [],
    combos = DEFAULT_COMBOS,
    paymentMethod: method = 'cash',
    cardFeeMode: feeMode = 'none',
    cardFeeValue: feeVal = 0
  } = inputOrComboPrice;

  const hasPrimo = !!(combo?.primo_formato && combo?.primo_condimento);
  const hasSecondo = !!combo?.secondo;
  const hasContorno = !!combo?.contorno;
  const hasSpecial = special_items.length > 0;

  let matchedCombo: ComboRow | Tables<'combos'> | null = null;
  let comboPriceCents = 0;

  if (hasPrimo || hasSecondo || hasContorno) {
    const validation = validateCombination(hasPrimo, hasSecondo, hasContorno);
    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
        combo: null,
        comboPriceCents: 0,
        drinkPriceCents: 0,
        specialItemsTotalCents: 0,
        subtotal: 0,
        subtotal_cents: 0,
        fee: 0,
        card_fee_cents: 0,
        total: 0,
        total_cents: 0,
        formatted_total: '0,00 €',
        order_lines: []
      };
    }

    matchedCombo = calculateCombo(combos, hasPrimo, hasSecondo, hasContorno);
    if (!matchedCombo) {
      return {
        valid: false,
        error: 'Nessuna combinazione valida trovata per i piatti selezionati.',
        combo: null,
        comboPriceCents: 0,
        drinkPriceCents: 0,
        specialItemsTotalCents: 0,
        subtotal: 0,
        subtotal_cents: 0,
        fee: 0,
        card_fee_cents: 0,
        total: 0,
        total_cents: 0,
        formatted_total: '0,00 €',
        order_lines: []
      };
    }
    comboPriceCents = matchedCombo.price_cents;
  } else if (!hasSpecial) {
    return {
      valid: false,
      error: 'Seleziona una combinazione del menu o almeno un piatto speciale.',
      combo: null,
      comboPriceCents: 0,
      drinkPriceCents: 0,
      specialItemsTotalCents: 0,
      subtotal: 0,
      subtotal_cents: 0,
      fee: 0,
      card_fee_cents: 0,
      total: 0,
      total_cents: 0,
      formatted_total: '0,00 €',
      order_lines: []
    };
  }

  // Drink extra price (+2,00 €)
  const drinkPriceCents = isExtraDrink(combo?.drink) ? DRINK_EXTRA_PRICE_CENTS : 0;

  // Special items total & order lines
  let calculatedSpecialTotal = 0;
  const orderLines: OrderTotalResult['order_lines'] = [];

  for (const item of special_items) {
    const unitPrice = item.unit_price_cents ?? item.price_cents ?? item.dbItem?.price_cents ?? 0;
    const name = item.name ?? item.dbItem?.name ?? 'Piatto speciale';
    calculatedSpecialTotal += unitPrice * item.qty;
    orderLines.push({
      special_item_id: item.id,
      name_snapshot: name,
      unit_price_cents: unitPrice,
      qty: item.qty
    });
  }

  const subtotal = comboPriceCents + drinkPriceCents + calculatedSpecialTotal;
  let fee = 0;
  if (method === 'card') {
    if (feeMode === 'fixed') {
      fee = feeVal;
    } else if (feeMode === 'percent') {
      fee = Math.round(subtotal * (feeVal / 100));
    }
  }

  const total = subtotal + fee;

  return {
    valid: true,
    combo: matchedCombo,
    comboPriceCents,
    drinkPriceCents,
    specialItemsTotalCents: calculatedSpecialTotal,
    subtotal,
    subtotal_cents: subtotal,
    fee,
    card_fee_cents: fee,
    total,
    total_cents: total,
    formatted_total: formatCurrency(total),
    order_lines: orderLines
  };
}
