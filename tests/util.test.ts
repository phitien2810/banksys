import { Util } from "../src/implementations";

describe("Util", () => {
  let util: Util;
  beforeEach(() => {
    util = new Util();
  });

  it("should normalise input", () => {
    const result = util.normaliseInput(" 20230626       AC001 W  100 ");
    expect(result).toBe("20230626 AC001 W 100");
  });

  it("should validate date", () => {
    expect(util.validateDate(" 20230626 x")).toBeFalsy();
    expect(util.validateDate("20230626")).toBeTruthy();
    expect(util.validateMonth("20230626")).toBeFalsy();
    expect(util.validateMonth("202306")).toBeTruthy();
  });

  it("should return last day of month", () => {
    expect(util.getLastDayOfMonth("20230626")).toBe(30);
    expect(util.getLastDayOfMonth("202307")).toBe(31);
    try {
      util.getLastDayOfMonth("2023");
    } catch (error) {
      expect(error).toBe("Wrong input.");
    }
  });

  it("should return number of days in a year", () => {
    expect(util.getDaysInYear("20230626")).toBe(365);
    expect(util.getDaysInYear("20240626")).toBe(366);
  });
});
