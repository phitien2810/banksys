import { Account, Bank } from "../src/implementations";

describe("Account", () => {
  let bank: Bank;

  beforeEach(() => {
    bank = new Bank();
  });

  it("should generate correct transaction IDs", () => {
    const accountId = "AC001";
    const obj = bank.getOrCreateAccount(accountId);
    const txnId1 = obj.generateTransactionId("20230626");
    expect(txnId1).toBe("20230626-01");
  });

  it("should create an account", () => {
    const accountId = "AC001";
    const obj = bank.getOrCreateAccount(accountId);
    expect(obj).toBeInstanceOf(Account);
    expect(obj.accountId).toBe(accountId);
    expect(obj.balance).toBe(0);
  });

  it("should print statement", () => {
    bank.defineInterestRule("20230101 RULE01 1.95");
    bank.defineInterestRule("20230520 RULE02 1.90");
    bank.defineInterestRule("20230615 RULE03 2.20");
    bank.defineInterestRule("20230701 RULE03 2.40");

    bank.inputTransaction("20230531 AC001 D 100.00");
    bank.inputTransaction("20230601 AC001 D 150.00");
    bank.inputTransaction("20230626 AC001 W 20.00");
    bank.inputTransaction("20230626 AC001 W 100.00");

    const account = bank.getOrCreateAccount("AC001");

    const rs = bank.printTransactions(account, "202306");
    expect(rs).toBe(`Account: AC001
| Date     | Txn Id      | Type | Amount | Balance |
| 20230601 | 20230601-01 | D    | 150.00 |  250.00 |
| 20230626 | 20230626-01 | W    |  20.00 |  230.00 |
| 20230626 | 20230626-02 | W    | 100.00 |  130.00 |
| 20230630 |             | I    |   0.39 |  130.39 |`);
  });
});
