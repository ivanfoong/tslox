#!/usr/bin/env node

import type { Arguments, CommandBuilder } from "yargs";
import { runFile, runPrompt } from "./tslox";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { defineAst } from "./tslox/generate_ast";

type Options = {
  path?: string;
};

yargs(hideBin(process.argv))
  .command(
    ["$0 [path]", "lex [path]", "$0", "lex"],
    "Parse <path>",
    (yargs) =>
      yargs.positional("path", { type: "string", demandOption: false }),
    (argv: Arguments<Options>) => {
      const { path } = argv;
      if (path) {
        runFile(path).then(() => process.exit(0));
      } else {
        runPrompt().then(() => process.exit(0));
      }
    }
  )
  .command(
    "generate_ast <outputDir>",
    "Generate ast <output directory>",
    (yargs) => yargs.positional("outputDir", { type: "string", demandOption: true }),
    (argv: Arguments<{ outputDir?: string }>) => {
      const { outputDir } = argv;
      if (outputDir === undefined) {
        process.stdout.write('Usage: generate_ast <output directory>\n');
        process.exit(64);
      }
      defineAst(outputDir, "Expr", [
        "Binary   : Expr left, Token operator, Expr right",
        "Grouping : Expr expression",
        "Literal  : Object value",
        "Unary    : Token operator, Expr right",
      ]);
    }
  )
  // Enable strict mode
  .strict()
  // Useful aliases
  .alias({ h: "help" }).argv;
