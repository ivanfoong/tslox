#!/usr/bin/env node

import type { Arguments, CommandBuilder } from "yargs";
import { runFile, runPrompt } from "./tslox";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

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
  // Enable strict mode
  .strict()
  // Useful aliases
  .alias({ h: "help" }).argv;
