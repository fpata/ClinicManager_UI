export interface Payment {
  PaymentID: number;
  BillingID: number;
  Amount: number;
  PaymentMethod: PaymentMethod;
  TransactionDate: string;   // ISO datetime
  Reference?: string;        // Check #, Auth code, etc.
  Notes?: string;
}
export enum PaymentMethod {
  Cash = 'Cash',
  UPI = 'UPI',
  CreditCard = 'CreditCard',
  DebitCard = 'DebitCard',
  Check = 'Check',
  BankTransfer = 'BankTransfer',
  Insurance = 'Insurance',
  Adjustment = 'Adjustment',
  WriteOff = 'WriteOff'
}