import { InterestRule, Transaction } from "./types";

export interface AccountInterface {
  accountId: string;
  transactions: Transaction[];
  balance: number;

  addTransaction(trans: Transaction): Transaction;
  generateTransactionId(date: string): string;
}

export interface BankInterface {
  interestRules: InterestRule[];
  accounts: Map<string, AccountInterface>;
  defineInterestRule(input: string);
  getAccount(accountId: string): AccountInterface;
  getOrCreateAccount(accountId: string): AccountInterface;
  inputTransaction(input: string): Transaction;
  getInterestRule(date: string): InterestRule | undefined;
  getEndOfDayBalance(account: AccountInterface, date: string): number;
  calculateInterest(account: AccountInterface, month: string): number;
  printTransactions(account: AccountInterface, date: string): string;
  printRules(): string;
}

export interface UtilInterface {
  normaliseInput(input: string): string;
  validateDate(input: string): boolean;
  validateMonth(input: string): boolean;
  getLastDayOfMonth(input: string): number;
  getDaysInYear(input: string): 365 | 366;
}
