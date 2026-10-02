import { create } from 'zustand';

interface OrderState {
  date: string | null;
  slotId: string | null;
  primo: {
    formato: string | null;
    condimento: string | null;
  };
  secondo: string | null;
  contorno: string | null;
  drink: string | null;
  specialItems: Record<string, number>;
  customer: {
    nome: string;
    cognome: string;
    azienda: string;
    note: string;
  };
  
  setDate: (date: string) => void;
  setSlotId: (slotId: string) => void;
  setPrimoFormato: (formato: string | null) => void;
  setPrimoCondimento: (condimento: string | null) => void;
  setSecondo: (secondo: string | null) => void;
  setContorno: (contorno: string | null) => void;
  setDrink: (drink: string | null) => void;
  setSpecialItem: (itemId: string, quantity: number) => void;
  setCustomerInfo: (info: Partial<OrderState['customer']>) => void;
  resetOrder: () => void;
}

const initialState = {
  date: null,
  slotId: null,
  primo: { formato: null, condimento: null },
  secondo: null,
  contorno: null,
  drink: null,
  specialItems: {},
  customer: { nome: '', cognome: '', azienda: 'Tecnokar', note: '' },
};

export const useOrderStore = create<OrderState>((set) => ({
  ...initialState,
  
  setDate: (date) => set({ date }),
  setSlotId: (slotId) => set({ slotId }),
  setPrimoFormato: (formato) => set((state) => ({ primo: { ...state.primo, formato } })),
  setPrimoCondimento: (condimento) => set((state) => ({ primo: { ...state.primo, condimento } })),
  setSecondo: (secondo) => set({ secondo }),
  setContorno: (contorno) => set({ contorno }),
  setDrink: (drink) => set({ drink }),
  setSpecialItem: (itemId, quantity) => set((state) => ({
    specialItems: { ...state.specialItems, [itemId]: quantity }
  })),
  setCustomerInfo: (info) => set((state) => ({
    customer: { ...state.customer, ...info }
  })),
  resetOrder: () => set(initialState),
}));
