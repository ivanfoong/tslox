import { TokenType } from "./token_type";

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
}

export const createToken = (
  type: TokenType,
  lexeme: string,
  literal: any,
  line: number
): Token => ({
  type,
  lexeme,
  literal,
  line,
});

export const tokenToString = (token: Token): string => JSON.stringify(token);
