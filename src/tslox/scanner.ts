import { errorLine } from ".";
import { createToken, Token } from "./token";
import { TokenType } from "./token_type";

export const keywords: Record<string, TokenType> = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
};

export class Scanner {
  source: string;
  tokens: Array<Token>;
  start = 0;
  current = 0;
  line = 1;

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
  }

  scanTokens = (): Array<Token> => {
    while (!this.isAtEnd()) {
      // We are at the beginning of the next lexeme
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(createToken(TokenType.EOF, "", null, this.line));
    return this.tokens;
  };

  scanToken = (): void => {
    const c = this.advance();
    switch (c) {
      case "(": {
        this.addToken(TokenType.LEFT_PAREN);
        break;
      }
      case ")": {
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      }
      case "{": {
        this.addToken(TokenType.LEFT_BRACE);
        break;
      }
      case "}": {
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      }
      case ",": {
        this.addToken(TokenType.COMMA);
        break;
      }
      case ".": {
        this.addToken(TokenType.DOT);
        break;
      }
      case "-": {
        this.addToken(TokenType.MINUS);
        break;
      }
      case "+": {
        this.addToken(TokenType.PLUS);
        break;
      }
      case ";": {
        this.addToken(TokenType.SEMICOLON);
        break;
      }
      case "*": {
        this.addToken(TokenType.STAR);
        break;
      }
      case "!": {
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      }
      case "=": {
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      }
      case "<": {
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      }
      case ">": {
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      }
      case "/": {
        if (this.match("/")) {
          // A comment goes until the end of the line
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      }
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace
        break;
      case "\n": {
        this.line++;
        break;
      }
      case '"': {
        this.string();
        break;
      }
      default: {
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          errorLine(this.line, "Unexpected character.");
        }
        break;
      }
    }
  };

  identifier = (): void => {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substr(this.start, this.current);
    const type = keywords[text] ?? TokenType.IDENTIFIER;
    this.addToken(type);
  };

  number = (): void => {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    // Look for a fractional part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      // Consume the "."
      this.advance();

      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(
      TokenType.NUMBER,
      parseFloat(this.source.substr(this.start, this.current))
    );
  };

  string = (): void => {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") {
        this.line++;
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      errorLine(this.line, "Unterminated string.");
      return;
    }

    // The closing "
    this.advance();

    // Trim the surrounding quotes
    const value = this.source.substr(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  };

  match = (expected: string): boolean => {
    if (this.isAtEnd()) {
      return false;
    }
    if (this.source.charAt(this.current) !== expected) {
      return false;
    }

    this.current++;
    return true;
  };

  peek = (): string => {
    if (this.isAtEnd()) {
      return "\0";
    }
    return this.source.charAt(this.current);
  };

  peekNext = (): string => {
    if (this.current + 1 >= this.source.length) {
      return "\0";
    }
    return this.source.charAt(this.current + 1);
  };

  isAlpha = (c: string): boolean =>
    (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";

  isAlphaNumeric = (c: string): boolean => this.isAlpha(c) || this.isDigit(c);

  isDigit = (c: string): boolean => c >= "0" && c <= "9";

  advance = (): string => this.source.charAt(this.current++);

  addToken = (type: TokenType, literal?: any): void => {
    const text = this.source.substr(this.start, this.current);
    this.tokens.push(createToken(type, text, literal, this.line));
  };

  isAtEnd = (): boolean => this.current >= this.source.length;
}
