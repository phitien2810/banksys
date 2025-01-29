export type TransactionType = "D" | "W" | "I";
export type InterestRule = { date: string; rate: number; ruleId: string };
export type Transaction = {
  txnId: string;
  date: string;
  type: TransactionType | undefined;
  amount: number;
  balance: number | undefined;
  account: string | undefined;
};
