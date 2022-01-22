# TSLox
Lox language compiler coded in Typescript
Based on <https://craftinginterpreters.com/>

## Usage

### Interactive mode
```sh
$ yarn dev
```

### Parsing source file
```sh
$ yarn ts-node src/cli.ts sample/main.lox
```

### Generate AST
```sh
$ yarn ts-node src/cli.ts generate_ast src/tslox/generated
```

### Test AST Printer
```sh
$ yarn ts-node src/cli.ts test_ast_printer
```

## Package
```sh
$ yarn build && yarn package
```