import { AccountInterface, BankInterface, UtilInterface } from "./interfaces";
import { InterestRule, Transaction } from "./types";

export class Util implements UtilInterface {
  public getDaysInYear(input: string): 365 | 366 {
    const year = parseInt(input.slice(0, 4));
    if (!year) {
      throw "Wrong input.";
    }
    return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0) ? 366 : 365;
  }
  public getLastDayOfMonth(input: string): number {
    const year = parseInt(input.slice(0, 4));
    const month = parseInt(input.slice(4, 6));
    if (!year || !month) {
      throw "Wrong input.";
    }
    return new Date(year, month, 0).getDate();
  }
  public validateDate(input: string): boolean {
    return input.length == 8;
  }
  public validateMonth(input: string): boolean {
    return input.length == 6;
  }
  public normaliseInput(input: string): string {
    return input.trim().replace(/\s+/gi, " ");
  }
}

export class Account implements AccountInterface {
  accountId: string;
  transactions: Transaction[] = [];
  balance: number = 0;

  constructor(accountId: string) {
    this.accountId = accountId;
    this.transactions = [];
    this.balance = 0;
  }
  public addTransaction(trans: Transaction): Transaction {
    const { date, type, amount } = trans;
    if (type === "W" && this.balance <= amount) {
      throw "Insufficient balance for withdrawal.";
    }
    this.balance = this.balance + (type === "D" ? amount : -amount);
    trans.account = this.accountId;
    trans.balance = this.balance;
    trans.txnId = this.generateTransactionId(date);
    // const left = [...this.transactions];
    // const right = [];
    // while (left.length) {
    //   const last = left.pop();
    //   if (parseInt(last.date) <= parseInt(trans.date)) {
    //     left.push(last);
    //     break;
    //   } else {
    //     right.push(last);
    //   }
    // }
    // this.transactions = [...left, trans, ...right];
    this.transactions.push(trans);
    this.transactions.sort(
      (tnx1, tnx2) => parseInt(tnx1.date) - parseInt(tnx2.date)
    );
    return trans;
  }

  public generateTransactionId(date: string): string {
    const txnCount = this.transactions.filter(
      (txn) => txn.date === date
    ).length;
    return `${date}-${String(txnCount + 1).padStart(2, "0")}`;
  }
}
export class Bank implements BankInterface {
  private util: Util = new Util();
  public interestRules: InterestRule[] = [];
  public accounts: Map<string, AccountInterface> = new Map();

  public inputTransaction(input: string): Transaction {
    input = this.util.normaliseInput(input);
    if (!input) {
      throw "Invalid input.";
    }

    const [date, account, type, amountStr] = input.split(" ");

    if (!this.util.validateDate(date)) {
      throw "Invalid date.";
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      throw "Invalid amount. Must be greater than zero.";
    }

    if (type !== "D" && type !== "W") {
      throw "Invalid transaction type. Use D for Deposit or W for Withdrawal.";
    }

    const accountObj = this.getOrCreateAccount(account);
    return accountObj.addTransaction({
      date,
      type,
      amount,
    } as Transaction);
  }

  public getAccount(accountId: string): AccountInterface {
    return this.accounts.get(accountId)!;
  }

  public getOrCreateAccount(accountId: string): AccountInterface {
    if (!this.accounts.has(accountId)) {
      this.accounts.set(accountId, new Account(accountId));
    }
    return this.accounts.get(accountId)!;
  }

  public defineInterestRule(input: string) {
    input = this.util.normaliseInput(input);
    if (!input) {
      throw "Invalid input.";
    }

    const [date, ruleId, rateStr] = input.split(" ");
    const rate = parseFloat(rateStr);
    if (isNaN(rate) || rate <= 0 || rate >= 100) {
      throw "Invalid interest rate. Must be between 0 and 100.";
    }

    const existingRuleIndex = this.interestRules.findIndex(
      (rule) => rule.date === date
    );
    if (existingRuleIndex >= 0) {
      this.interestRules[existingRuleIndex] = { date, rate, ruleId };
    } else {
      this.interestRules.push({ date, rate, ruleId });
    }

    this.interestRules.sort((a, b) => a.date.localeCompare(b.date));
  }

  public getEndOfDayBalance(account: AccountInterface, date: string): number {
    const validTnxs = account.transactions.filter(
      (tnx) => parseInt(date) >= parseInt(tnx.date)
    );
    return validTnxs[validTnxs.length - 1]?.balance || 0;
  }

  public getInterestRule(date: string): InterestRule | undefined {
    const dateNum = parseInt(date);
    const month = date.slice(0, 6);
    let lastDate = parseInt(`${month}${this.util.getLastDayOfMonth(month)}`);
    const rules = [...this.interestRules];

    while (rules.length) {
      const rule = rules.pop();
      const ruleDate = parseInt(rule.date);
      if (ruleDate > lastDate) continue;
      if (ruleDate > dateNum) continue;
      return rule;
    }

    return;
  }

  public calculateInterest(account: AccountInterface, month: string): number {
    if (!this.interestRules.length) return 0;
    let start = parseInt(`${month}01`);
    let rule = this.getInterestRule(`${start}`);
    if (!rule) return 0;
    const daysInMonth = this.util.getLastDayOfMonth(month);
    const daysInYear = this.util.getDaysInYear(month);
    const lastDay = parseInt(`${month}${daysInMonth}`);
    let rs = [] as {
      balance: number;
      rate: number;
      days: number;
      start: number;
      end: number;
    }[];

    const monthTransactions = this.getMonthTransactions(account, month);

    while (monthTransactions.length) {
      const trans = monthTransactions.shift();
      if (monthTransactions.length && monthTransactions[0].date == trans.date)
        continue;

      const transDate = parseInt(trans.date);

      let nextRule = this.interestRules[this.interestRules.indexOf(rule) + 1];
      if (nextRule && parseInt(nextRule.date) < lastDay) {
        let end = parseInt(nextRule.date);
        if (transDate > end) {
          rs.push({
            balance: this.getEndOfDayBalance(account, `${end - 1}`),
            rate: rule.rate,
            days: end - start,
            start,
            end: end - 1,
          });
          start = end;
          end = transDate;
          rs.push({
            balance: this.getEndOfDayBalance(account, `${end - 1}`),
            rate: nextRule.rate,
            days: end - start,
            start,
            end: end - 1,
          });
          start = end;
          rule = nextRule;
          nextRule = this.interestRules[this.interestRules.indexOf(rule) + 1];
        }
      } else {
        break;
      }
    }

    rs.push({
      balance: this.getEndOfDayBalance(account, `${lastDay}`),
      rate: rule.rate,
      days: lastDay - start + 1,
      start,
      end: lastDay,
    });

    return rs.reduce((interest, o) => {
      interest += o.balance * (o.rate / 100 / daysInYear) * o.days;
      return interest;
    }, 0);
  }

  public printTransactions(account: AccountInterface, date: string): string {
    if (!account) {
      throw "Account not found.";
    }

    const rs = [];

    rs.push(`Account: ${account.accountId}`);
    rs.push("| Date     | Txn Id      | Type | Amount | Balance |");

    const month = date.slice(0, 6);
    const lastDate = `${month}${this.util.getLastDayOfMonth(month)}`;
    const transactions = this.getMonthTransactions(account, month);
    transactions.forEach((txn) => {
      rs.push(
        `| ${txn.date} | ${txn.txnId} | ${txn.type.padEnd(
          4,
          " "
        )} | ${txn.amount.toFixed(2).padStart(6, " ")} | ${txn.balance
          .toFixed(2)
          .padStart(7, " ")} |`
      );
    });

    const balance = transactions[transactions.length - 1]?.balance || 0;
    const interest = this.calculateInterest(account, month);

    rs.push(
      `| ${lastDate} |             | I    | ${interest
        .toFixed(2)
        .padStart(6, " ")} | ${(balance + interest)
        .toFixed(2)
        .padStart(7, " ")} |`
    );

    return rs.join("\n");
  }

  private getMonthTransactions(
    account: AccountInterface,
    month: string
  ): Transaction[] {
    return account.transactions.filter((txn) => txn.date.slice(0, 6) === month);
  }

  public printRules(): string {
    const rs = [];
    rs.push("Interest rules:");
    rs.push("| Date     | RuleId | Rate (%) |");
    this.interestRules.forEach((rule) => {
      rs.push(
        `| ${rule.date} | ${rule.ruleId} | ${rule.rate
          .toFixed(2)
          .padStart(8, " ")} |`
      );
    });
    return rs.join("\n");
  }
}
