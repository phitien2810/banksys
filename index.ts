import * as readlineSync from "readline-sync";
import { Bank } from "./src/implementations";

class Application {
  private bank: Bank = new Bank();

  public start() {
    while (true) {
      console.log(`
Welcome to AwesomeGIC Bank! What would you like to do?
[T] Input transactions 
[I] Define interest rules
[P] Print statement
[Q] Quit
>`);
      const choice = readlineSync.question().toUpperCase();

      switch (choice) {
        case "T":
          this.inputTransaction();
          break;
        case "I":
          this.defineInterestRule();
          break;
        case "P":
          this.printStatement();
          break;
        case "Q":
          this.quit();
          return;
        default:
          console.log("Invalid choice. Please try again.");
      }
    }
  }

  private inputTransaction() {
    const transactionDetails = readlineSync.question(
      "Please enter transaction details in <Date> <Account> <Type> <Amount> format (or enter blank to go back to main menu): "
    );

    if (!transactionDetails.trim()) return;

    try {
      const trans = this.bank.inputTransaction(transactionDetails);
      console.log(
        `Account: ${
          trans.account
        }\n| Date     | Txn Id      | Type | Amount |\n| ${trans.date} | ${
          trans.txnId
        } | ${trans.type.padEnd(3, " ")}  | ${trans.amount
          .toFixed(2)
          .padStart(6, " ")} |`
      );
    } catch (error) {
      console.log(error);
    }
  }

  private defineInterestRule() {
    const interestDetails = readlineSync.question(
      "Please enter interest rule details in <Date> <RuleId> <Rate> format (or enter blank to go back to main menu): "
    );

    if (!interestDetails.trim()) return;

    try {
      this.bank.defineInterestRule(interestDetails);
      console.log(this.bank.printRules());
    } catch (error) {
      console.log(error);
    }
  }

  private printStatement() {
    const account = readlineSync.question(
      "Please enter account and month to generate the statement <Account> <Year><Month> (or enter blank to go back to main menu): "
    );

    if (!account.trim()) return;

    const [accountId, month] = account.split(" ");
    const accountObj = this.bank.getAccount(accountId);

    try {
      console.log(this.bank.printTransactions(accountObj, month));
    } catch (error) {
      console.log(error);
    }
  }

  private quit() {
    console.log("Thank you for banking with AwesomeGIC Bank.");
    console.log("Have a nice day!");
  }
}

const bank = new Application();
bank.start();
