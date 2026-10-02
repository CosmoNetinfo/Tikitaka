import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateOrderTotal, DEFAULT_COMBOS } from '@/lib/utils/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Load active combos from database
    const { data: dbCombos } = await supabase
      .from('combos')
      .select('*')
      .eq('is_active', true);

    const combos = dbCombos && dbCombos.length > 0 ? dbCombos : DEFAULT_COMBOS;

    const result = calculateOrderTotal({
      combo: body.combo,
      special_items: body.special_items,
      combos,
      paymentMethod: body.payment_method || 'cash',
      cardFeeMode: body.card_fee_mode || 'none',
      cardFeeValue: body.card_fee_value || 0
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error calculating price on server:', error);
    return NextResponse.json({ error: 'Errore nel calcolo del prezzo' }, { status: 500 });
  }
}
