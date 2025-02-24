use crate::utils::error::CalculatorError;
use crate::utils::token::{Operator, Token};

pub struct Parser;

impl Parser {
    pub fn parse(input: &str) -> Result<Vec<Token>, CalculatorError> {
        let mut tokens = Vec::new();
        let mut chars = input.chars().peekable();

        while let Some(&c) = chars.peek() {
            match c {
                '0'..='9' | '.' => {
                    let mut number = String::new();
                    while let Some(&c) = chars.peek() {
                        if c.is_digit(10) || c == '.' {
                            number.push(c);
                            chars.next();
                        } else {
                            break;
                        }
                    }
                    tokens.push(Token::Number(number.parse().map_err(|_| {
                        CalculatorError::ParseError("Invalid number".to_string())
                    })?));
                }
                '+' => {
                    tokens.push(Token::Operator(Operator::Add));
                    chars.next();
                }
                '-' => {
                    tokens.push(Token::Operator(Operator::Subtract));
                    chars.next();
                }
                '*' => {
                    tokens.push(Token::Operator(Operator::Multiply));
                    chars.next();
                }
                '/' => {
                    tokens.push(Token::Operator(Operator::Divide));
                    chars.next();
                }
                '(' => {
                    tokens.push(Token::LeftParen);
                    chars.next();
                }
                ')' => {
                    tokens.push(Token::RightParen);
                    chars.next();
                }
                ' ' => {
                    chars.next();
                }
                _ => {
                    return Err(CalculatorError::ParseError(format!(
                        "Invalid character: {}",
                        c
                    )))
                }
            }
        }
        Ok(tokens)
    }
}
