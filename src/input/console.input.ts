import * as readline from "readline";
import { Observable } from "rxjs";

export const createConsoleReadStream: () => Observable<string> = () => {
  return new Observable((subscriber) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.on("line", (input) => {
      subscriber.next(input);
    });

    return () => rl.close();
  });
};
