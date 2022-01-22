import { runtimeError } from ".";
import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./generated/Expr"
import { RuntimeError } from "./runtime_error"
import { Token } from "./token";
import { TokenType } from "./token_type"

export class Interpreter implements Visitor<any> {
  interpret(expression: Expr) {
    try {
      const value = this.evaluate(expression)
      console.log(this.stringify(value))
    } catch (e) {
      if (e instanceof RuntimeError) {
        runtimeError(e)
      }
    }
  }

  visitLiteralExpr(expr: Literal) {
    return expr.value
  }

  visitGroupingExpr(expr: Grouping) {
    return this.evaluate(expr.expression)
  }

  visitUnaryExpr(expr: Unary) {
    const right = this.evaluate(expr.right)

    switch(expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right)
      case TokenType.MINUS:
        this.checkNumberOperand(expr.operator, right)
        return -(right as number)
    }
    return null
  }

  private checkNumberOperand(operator: Token, operand: any) {
    if (typeof operand === 'number') {
      return
    }
    throw new RuntimeError(operand, 'Operand must be a number.')
  }

  private checkNumberOperands(operator: Token, left: any, right: any) {
    if (typeof left === 'number' && typeof right === 'number') {
      return
    }
    throw new RuntimeError(operator, 'Operands must be a numbers.')
  }

  private isTruthy(object: any): boolean {
    if (object === null) {
      return false
    }
    if (typeof object === "boolean") {
      return object === true
    }
    return true
  }

  private isEqual(a: any, b: any) {
    if (a === null && b === null) {
      return true
    }
    if (a === null) {
      return false
    }

    return a === b
  }

  private stringify(object: any) {
    if (object === null) {
      return 'nil'
    }

    if (typeof object === 'number') {
      let text = `${object}`
      if (text.endsWith('.0')) {
        text = text.substring(0, text.length - 2)
      }
      return text
    }

    return `${object}`
  }

  visitBinaryExpr(expr: Binary) {
    const left = this.evaluate(expr.left)
    const right = this.evaluate(expr.right)

    switch(expr.operator.type) {
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) > (right as number)
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) >= (right as number)
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) < (right as number)
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) <= (right as number)
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right)
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right)
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) - (right as number)
      case TokenType.PLUS:
        if (typeof left === 'number' && typeof right === 'number') {
          return (left as number) + (right as number)
        }
        if (typeof left === 'string' && typeof right === 'string') {
          return `${left}${right}`
        }
        break
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) - (right as number)
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right)
        return (left as number) - (right as number)
    }

    // Unreachable.
    return null;
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this)
  }
}