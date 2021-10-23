import { promises } from "fs";
import { createInterface } from "readline";
import { Scanner } from "./scanner";
import { tokenToString } from "./token";
const { readFile } = promises;

let hadError = false;

export const report = (line: number, where: string, message: string) => {
  process.stdout.write(`[line ${line}] Error${where}: ${message}`);
  hadError = true;
};

export const error = (line: number, message: string) =>
  report(line, "", message);

const run = async (source: string): Promise<void> => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  for (const token of tokens) {
    process.stdout.write(`${tokenToString(token)}\n`);
  }
};

export const runPrompt = async (): Promise<void> => {
  const ask = async (question: string): Promise<string> => {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise((resolve) =>
      readline.question(question, (answer) => {
        readline.close();
        resolve(answer);
      })
    );
  };
  while (true) {
    const line = await ask("> ");
    if (line === "") {
      break;
    }
    await run(line);
    hadError = false;
  }
};

export const runFile = async (path: string): Promise<void> => {
  const bytes = await readFile(path);
  await run(String(bytes));

  // Indicate an error in the exit code
  if (hadError) {
    process.exit(65);
  }
};
