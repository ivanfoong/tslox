import { Expr, Visitor, Binary, Grouping, Literal, Unary } from "./generated/Expr"

export class AstPrinter implements Visitor<string> {
  visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
  }

  visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize('group', expr.expression)
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) {
      return 'nil'
    }
    return expr.value.toString()
  }

  visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right)
  }

  print(expr: Expr) {
    return expr.accept(this)
  }

  private parenthesize(name: string, ...exprs: Array<Expr>): string {
    let value = `(${name}`

    for (const expr of exprs) {
      value = `${value} ${expr.accept(this)}`
    }

    value = `${value})`
    return value
  }
}

if (require.main === module) {
  console.log('hello')
}