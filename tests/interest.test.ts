import { Bank } from "../src/implementations";

describe("Interest", () => {
  let bank: Bank;
  beforeEach(() => {
    bank = new Bank();
  });

  it("should allow defining and listing interest rules", () => {
    bank.defineInterestRule("20230101 RULE01 1.95");
    expect(bank.interestRules.length).toBe(1);
    expect(bank.interestRules[0].date).toBe("20230101");
    expect(bank.interestRules[0].ruleId).toBe("RULE01");
    expect(bank.interestRules[0].rate).toBe(1.95);
    bank.defineInterestRule("20230101 RULE01 2.10");
    expect(bank.interestRules[0].rate).toBe(2.1);
  });

  it("should print interest rules", () => {
    bank.defineInterestRule("20230101 RULE01 1.95");
    bank.defineInterestRule("20230520 RULE02 1.90");
    bank.defineInterestRule("20230615 RULE03 2.20");
    const rs = bank.printRules();
    expect(rs).toBe(`Interest rules:
| Date     | RuleId | Rate (%) |
| 20230101 | RULE01 |     1.95 |
| 20230520 | RULE02 |     1.90 |
| 20230615 | RULE03 |     2.20 |`);
  });

  it("should return interest rule", () => {
    bank.defineInterestRule("20230101 RULE01 1.95");
    bank.defineInterestRule("20230520 RULE02 1.90");
    bank.defineInterestRule("20230615 RULE03 2.20");
    bank.defineInterestRule("20230701 RULE03 2.40");

    expect(bank.getInterestRule("20230601")?.ruleId).toBe("RULE02");
    expect(bank.getInterestRule("20230615")?.ruleId).toBe("RULE03");
    expect(bank.getInterestRule("20230626")?.ruleId).toBe("RULE03");
  });

  it("should retun zero interest", () => {
    bank.defineInterestRule("20230701 RULE03 2.40");

    bank.inputTransaction("20230531 AC001 D 100.00");
    bank.inputTransaction("20230601 AC001 D 150.00");
    bank.inputTransaction("20230626 AC001 W 20.00");
    bank.inputTransaction("20230626 AC001 W 100.00");
    bank.inputTransaction("20230701 AC001 D 100.00");

    const account = bank.getOrCreateAccount("AC001");

    expect(bank.calculateInterest(account, "202306")).toBe(0);
  });

  it("should retun interest with an old rule", () => {
    bank.defineInterestRule("20230520 RULE02 1.90");

    bank.inputTransaction("20230531 AC001 D 100.00");
    bank.inputTransaction("20230601 AC001 D 150.00");
    bank.inputTransaction("20230626 AC001 W 20.00");
    bank.inputTransaction("20230626 AC001 W 100.00");
    bank.inputTransaction("20230701 AC001 D 100.00");

    const account = bank.getOrCreateAccount("AC001");

    expect(bank.getEndOfDayBalance(account, "20230630")).toBe(130);
    expect(bank.calculateInterest(account, "202306")).toBe(
      130 * (1.9 / 100 / 365) * 30
    );
  });

  it("should calculate interest", () => {
    bank.defineInterestRule("20230101 RULE01 1.95");
    bank.defineInterestRule("20230520 RULE02 1.90");
    bank.defineInterestRule("20230615 RULE03 2.20");
    bank.defineInterestRule("20230701 RULE03 2.40");

    bank.inputTransaction("20230531 AC001 D 100.00");
    bank.inputTransaction("20230601 AC001 D 150.00");
    bank.inputTransaction("20230626 AC001 W 20.00");
    bank.inputTransaction("20230626 AC001 W 100.00");
    bank.inputTransaction("20230701 AC001 D 100.00");

    const account = bank.getOrCreateAccount("AC001");

    expect(bank.getEndOfDayBalance(account, "20230520")).toBe(0);
    expect(bank.getEndOfDayBalance(account, "20230614")).toBe(250);
    expect(bank.getEndOfDayBalance(account, "20230625")).toBe(250);
    expect(bank.getEndOfDayBalance(account, "20230626")).toBe(130);
    expect(bank.getEndOfDayBalance(account, "20230630")).toBe(130);

    expect(Math.round(100 * bank.calculateInterest(account, "202306"))).toBe(
      39
    );
  });
});
