import { promises } from "fs";
import { createInterface } from "readline";
import { AstPrinter } from "./ast_printer";
import { Interpreter } from "./interpreter";
import { Parser } from "./parser";
import { RuntimeError } from "./runtime_error";
import { Scanner } from "./scanner";
import { Token, tokenToString } from "./token";
import { TokenType } from "./token_type";
const { readFile } = promises;

const interpreter = new Interpreter()
let hadError = false;
let hadRuntimeError = false

export const report = (line: number, where: string, message: string) => {
  process.stdout.write(`[line ${line}] Error${where}: ${message}`);
  hadError = true;
};

export const error = (token: Token, message: string) => {
  if (token.type === TokenType.EOF) {
    report(token.line, ' at end', message)
  } else {
    report(token.line, ` at '${token.lexeme}'`, message)
  }
}

export const runtimeError = (error: RuntimeError) => {
  console.error(`${error.message}\n[line "${error.token.line}"]`)
  hadRuntimeError = true
}

export const errorLine = (line: number, message: string) =>
  report(line, "", message);

const run = async (source: string): Promise<void> => {
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens)
  const expression = parser.parse()

  // Stop if there was a syntax error
  if (hadError) {
    return
  }

  if (expression !== null) {
    interpreter.interpret(expression)
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
  if (hadRuntimeError) {
    process.exit(70);
  }
};
