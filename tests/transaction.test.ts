import { Bank } from "../src/implementations";

describe("Transaction", () => {
  let bank: Bank;
  beforeEach(() => {
    bank = new Bank();
  });

  it("should not create an account due to no input", () => {
    try {
      bank.inputTransaction(" ");
    } catch (error) {
      expect(error).toBe("Invalid input.");
    }
  });

  it("should not create an account due to wrong date", () => {
    try {
      bank.inputTransaction("202306261 AC001 D 100");
    } catch (error) {
      expect(error).toBe("Invalid date.");
    }
  });

  it("should not create an account due to wrong ammount", () => {
    try {
      bank.inputTransaction("20230626 AC001 D -100");
    } catch (error) {
      expect(error).toBe("Invalid amount. Must be greater than zero.");
    }
  });

  it("should create an account but failed to withdraw due to insufficient balance", () => {
    try {
      bank.inputTransaction("20230626 AC001 W 100");
    } catch (error) {
      const account = bank.accounts.get("AC001");
      expect(account?.balance).toBe(0);
      expect(error).toBe("Insufficient balance for withdrawal.");
    }
  });

  it("should create an account and process a deposit & withdraw transaction", () => {
    const account = bank.getOrCreateAccount("AC001");
    bank.inputTransaction("20230626 AC001 D 100");
    expect(account?.balance).toBe(100);
    bank.inputTransaction("20230626 AC001 W 50");
    expect(account?.balance).toBe(50);
  });
});
