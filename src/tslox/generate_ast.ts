import { writeFileSync } from 'fs'

const defineType = (baseName: string, className: string, fields: string): string =>
`export class ${className} extends ${baseName} {
${fields.split(', ').map((f) => {
  const [type, name] = f.split(' ');
  return `  ${name}: ${type}`;
}).join('\n')}
  constructor(${fields.split(', ').map((f) => {
    const [type, name] = f.split(' ');
    return `${name}: ${type}`;
  }).join(',')}) {
    super()
    ${fields.split(', ').map((f) => {
      const [_, name] = f.split(' ');
      return `this.${name} = ${name}`;
    }).join('\n    ')}
  }
  accept<R>(visitor: Visitor<R>): R {
    return visitor.visit${className}${baseName}(this)
  }
}
`

const defineVisitor = (baseName: string, types: Array<string>): string =>
`export interface Visitor<R> {
${types.map((t) => {
  const typeName = t.split(':')[0].trim();
  return `  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): R;`;
}).join('\n')}
}
`

export const defineAst = (outputDir: string, baseName: string, types: Array<string>): void => {
  const path = `${outputDir}/${baseName}.ts`;
  const classes: Array<string> = [];
  // The AST classes
  for (const type of types) {
    const className = type.split(':')[0].trim();
    const fields = type.split(':')[1].trim();
    classes.push(defineType(baseName, className, fields));
  }
  const content =
`import { Token } from './../token'

export abstract class ${baseName} {
  abstract accept<R>(visitor: Visitor<R>): R;
}

${defineVisitor(baseName, types)}
${classes.join('\n')}
`
  writeFileSync(path, content, { flag: 'w+' });
}