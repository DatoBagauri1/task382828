import type { PaymentMethod } from '@/types';

export type BankTransferMethod = Exclude<PaymentMethod, 'cash_on_delivery'>;

export type BankTransferAccount = {
  receiver: string;
  account: string;
};

export const bankTransferAccounts: Record<BankTransferMethod, BankTransferAccount> = {
  tbc_transfer: {
    receiver: 'ALEXANDRA LIMITED COLLECTION LLC',
    account: 'GE24TB0000000000000001',
  },
  bog_transfer: {
    receiver: 'ALEXANDRA LIMITED COLLECTION LLC',
    account: 'GE29BG0000000000000002',
  },
};

export const getBankTransferAccount = (method: PaymentMethod | undefined) => {
  if (method === 'tbc_transfer' || method === 'bog_transfer') {
    return bankTransferAccounts[method];
  }

  return null;
};
