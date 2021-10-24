import { writeFileSync } from 'fs'

const defineType = (baseName: string, className: string, fields: string): string =>
`  static class ${className} extends ${baseName} {
    ${className}(${fields}) {
${fields.split(', ').map((f) => {
  const name = f.split(' ')[1];
  return `      this.${name} = ${name};`;
}).join('\n')}
    }

${fields.split(', ').map((f) => `    final ${f};`).join('\n')}
  }
`

export const defineAst = (outputDir: string, baseName: string, types: Array<string>): void => {
  const path = `${outputDir}/${baseName}.java`;
  const classes: Array<string> = [];
  // The AST classes
  for (const type of types) {
    const className = type.split(':')[0].trim();
    const fields = type.split(':')[1].trim();
    classes.push(defineType(baseName, className, fields));
  }
  const content =
`package com.craftinginterpreters.lox;

import java.utils.List;

abstract class ${baseName} {
${classes.join('\n')}
}
`
  writeFileSync(path, content, { flag: 'w+' });
}