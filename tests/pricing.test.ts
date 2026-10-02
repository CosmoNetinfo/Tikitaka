import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCombo,
  validateCombination,
  calculateOrderTotal,
  DEFAULT_COMBOS,
  DRINK_EXTRA_PRICE_CENTS,
  formatCurrency
} from '../src/lib/utils/pricing.ts';
import { formatDateItalian } from '../src/lib/utils/format.ts';

test('Tabella combos di riferimento contiene i 5 menu standard', () => {
  assert.equal(DEFAULT_COMBOS.length, 5);
  
  const primo = DEFAULT_COMBOS.find(c => c.has_primo && !c.has_secondo && !c.has_contorno);
  assert.equal(primo?.price_cents, 600, 'Primo + acqua deve costare 6 € (600 cent)');

  const secondo = DEFAULT_COMBOS.find(c => !c.has_primo && c.has_secondo && !c.has_contorno);
  assert.equal(secondo?.price_cents, 600, 'Secondo + acqua deve costare 6 € (600 cent)');

  const secondoContorno = DEFAULT_COMBOS.find(c => !c.has_primo && c.has_secondo && c.has_contorno);
  assert.equal(secondoContorno?.price_cents, 800, 'Secondo + contorno + acqua deve costare 8 € (800 cent)');

  const primoSecondo = DEFAULT_COMBOS.find(c => c.has_primo && c.has_secondo && !c.has_contorno);
  assert.equal(primoSecondo?.price_cents, 1000, 'Primo + secondo + acqua deve costare 10 € (1000 cent)');

  const completo = DEFAULT_COMBOS.find(c => c.has_primo && c.has_secondo && c.has_contorno);
  assert.equal(completo?.price_cents, 1300, 'Primo + secondo + contorno + acqua deve costare 13 € (1300 cent)');

  assert.equal(DRINK_EXTRA_PRICE_CENTS, 200, 'La bibita extra deve costare 2 € (200 cent)');
});

test('Combinazioni valide SENZA bibita', () => {
  // 1. Primo + acqua (6,00 €)
  const res1 = calculateOrderTotal({
    combo: { primo_formato: 'Linguine', primo_condimento: 'Pomodoro e basilico' }
  });
  assert.equal(res1.valid, true);
  assert.equal(res1.total_cents, 600);
  assert.equal(res1.formatted_total, '6,00 €');

  // 2. Secondo + acqua (6,00 €)
  const res2 = calculateOrderTotal({
    combo: { secondo: 'Coscetti di pollo' }
  });
  assert.equal(res2.valid, true);
  assert.equal(res2.total_cents, 600);
  assert.equal(res2.formatted_total, '6,00 €');

  // 3. Secondo + contorno + acqua (8,00 €)
  const res3 = calculateOrderTotal({
    combo: { secondo: 'Coscetti di pollo', contorno: 'Patate al forno' }
  });
  assert.equal(res3.valid, true);
  assert.equal(res3.total_cents, 800);
  assert.equal(res3.formatted_total, '8,00 €');

  // 4. Primo + secondo + acqua (10,00 €)
  const res4 = calculateOrderTotal({
    combo: {
      primo_formato: 'Linguine',
      primo_condimento: 'Pomodoro e basilico',
      secondo: 'Coscetti di pollo'
    }
  });
  assert.equal(res4.valid, true);
  assert.equal(res4.total_cents, 1000);
  assert.equal(res4.formatted_total, '10,00 €');

  // 5. Primo + secondo + contorno + acqua (13,00 €)
  const res5 = calculateOrderTotal({
    combo: {
      primo_formato: 'Linguine',
      primo_condimento: 'Pomodoro e basilico',
      secondo: 'Coscetti di pollo',
      contorno: 'Patate al forno'
    }
  });
  assert.equal(res5.valid, true);
  assert.equal(res5.total_cents, 1300);
  assert.equal(res5.formatted_total, '13,00 €');
});

test('Combinazioni valide CON bibita (+2,00 €)', () => {
  // 1. Primo + acqua + Coca-Cola (6 € + 2 € = 8,00 €)
  const res1 = calculateOrderTotal({
    combo: {
      primo_formato: 'Linguine',
      primo_condimento: 'Pomodoro e basilico',
      drink: 'Coca-Cola'
    }
  });
  assert.equal(res1.valid, true);
  assert.equal(res1.comboPriceCents, 600);
  assert.equal(res1.drinkPriceCents, 200);
  assert.equal(res1.total_cents, 800);
  assert.equal(res1.formatted_total, '8,00 €');

  // 2. Secondo + acqua + Fanta (6 € + 2 € = 8,00 €)
  const res2 = calculateOrderTotal({
    combo: {
      secondo: 'Coscetti di pollo',
      drink: 'Fanta'
    }
  });
  assert.equal(res2.valid, true);
  assert.equal(res2.total_cents, 800);
  assert.equal(res2.formatted_total, '8,00 €');

  // 3. Secondo + contorno + acqua + Sprite (8 € + 2 € = 10,00 €)
  const res3 = calculateOrderTotal({
    combo: {
      secondo: 'Coscetti di pollo',
      contorno: 'Patate al forno',
      drink: 'Sprite'
    }
  });
  assert.equal(res3.valid, true);
  assert.equal(res3.total_cents, 1000);
  assert.equal(res3.formatted_total, '10,00 €');

  // 4. Primo + secondo + acqua + Coca-Cola (10 € + 2 € = 12,00 €)
  const res4 = calculateOrderTotal({
    combo: {
      primo_formato: 'Linguine',
      primo_condimento: 'Pomodoro e basilico',
      secondo: 'Coscetti di pollo',
      drink: 'Coca-Cola'
    }
  });
  assert.equal(res4.valid, true);
  assert.equal(res4.total_cents, 1200);
  assert.equal(res4.formatted_total, '12,00 €');

  // 5. Esempio utente: Primo + secondo + contorno + acqua + Coca-Cola (13 € + 2 € = 15,00 €)
  const res5 = calculateOrderTotal({
    combo: {
      primo_formato: 'Linguine',
      primo_condimento: 'Pomodoro e basilico',
      secondo: 'Coscetti di pollo',
      contorno: 'Patate al forno',
      drink: 'Coca-Cola'
    }
  });
  assert.equal(res5.valid, true);
  assert.equal(res5.comboPriceCents, 1300);
  assert.equal(res5.drinkPriceCents, 200);
  assert.equal(res5.total_cents, 1500);
  assert.equal(res5.formatted_total, '15,00 €');
});

test('Rifiuto delle combinazioni NON valide', () => {
  // 1. Solo contorno
  const soloContorno = validateCombination(false, false, true);
  assert.equal(soloContorno.valid, false, 'Solo contorno deve essere rifiutato');
  
  const resSoloContorno = calculateOrderTotal({
    combo: { contorno: 'Patate al forno' }
  });
  assert.equal(resSoloContorno.valid, false);
  assert.ok(resSoloContorno.error?.includes('contorno non può essere ordinato da solo'));

  // 2. Primo + contorno (senza secondo)
  const primoContorno = validateCombination(true, false, true);
  assert.equal(primoContorno.valid, false, 'Primo + contorno senza secondo deve essere rifiutato');

  const resPrimoContorno = calculateOrderTotal({
    combo: {
      primo_formato: 'Linguine',
      primo_condimento: 'Pomodoro e basilico',
      contorno: 'Patate al forno'
    }
  });
  assert.equal(resPrimoContorno.valid, false);
  assert.ok(resPrimoContorno.error?.includes('disponibile solo con il secondo'));

  // 3. Nessun piatto e nessun fuori menu
  const resVuoto = calculateOrderTotal({ combo: {} });
  assert.equal(resVuoto.valid, false);
});

test('Formato italiano per importi e date', () => {
  assert.equal(formatCurrency(1500), '15,00 €');
  assert.equal(formatCurrency(600), '6,00 €');
  assert.equal(formatCurrency(800), '8,00 €');
  assert.equal(formatCurrency(1000), '10,00 €');
  assert.equal(formatCurrency(1300), '13,00 €');
  assert.equal(formatCurrency(200), '2,00 €');
  assert.equal(formatCurrency(0), '0,00 €');

  // Mese in minuscolo nelle date
  const dateStr = formatDateItalian(new Date(2026, 9, 6)); // 6 ottobre 2026 (mese 9 = ottobre 0-indexed)
  assert.equal(dateStr, 'Martedì 6 ottobre');
  assert.ok(!dateStr.includes('Ottobre'), 'Il mese deve essere in minuscolo (ottobre, non Ottobre)');
});
