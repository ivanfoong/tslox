import { Binary, Expr, Grouping, Literal, Unary } from "./generated/Expr"
import { Token } from "./token"
import { TokenType } from "./token_type"
import { error } from "./index"

class ParseError extends Error {}

export class Parser {
  private tokens: Array<Token>
  private current = 0

  constructor(tokens: Array<Token>) {
    this.tokens = tokens
  }
  
  parse(): Expr|null {
    try {
      return this.expression()
    } catch(e) {
      if (e instanceof ParseError) {
        return null
      }
      return null
    }
  }

  private expression(): Expr {
    return this.equality()
  }

  private equality(): Expr {
    let expr: Expr = this.comparison()

    while(this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous()
      const right = this.comparison()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private comparison(): Expr {
    let expr = this.term()

    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous()
      const right = this.term()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private term(): Expr {
    let expr = this.factor()

    while(this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous()
      const right = this.factor()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private factor(): Expr {
    let expr = this.unary()

    while(this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous()
      const right = this.unary()
      expr = new Binary(expr, operator, right)
    }

    return expr
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous()
      const right = this.unary()
      return new Unary(operator, right)
    }

    return this.primary()
  }

  private primary(): Expr {
    if (this.match(TokenType.FALSE)) {
      return new Literal(false)
    }
    if (this.match(TokenType.TRUE)) {
      return new Literal(true)
    }
    if (this.match(TokenType.NIL)) {
      return new Literal(null)
    }

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal)
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression()
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
      return new Grouping(expr)
    }

    throw error(this.peek(), 'Expect expression')
  }

  private match(...types: Array<TokenType>): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance()
        return true
      }
    }

    return false
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance()
    }

    throw this.error(this.peek(), message)
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false
    }

    return this.peek().type === type
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++
    }

    return this.previous()
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  private error(token: Token, message: string) {
    error(token, message)
    return new ParseError()
  }

  private synchronize() {
    this.advance()

    while(!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) {
        return
      }

      switch(this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return
      }
    }

    this.advance()
  }
}