use crate::utils::error::CalculatorError;
use crate::utils::parser::Parser;
use crate::utils::token::Token;

pub struct Calculator {
    result: f64,
}

impl Calculator {
    pub fn new() -> Self {
        Calculator { result: 0.0 }
    }

    pub fn evaluate(&mut self, expression: &str) -> Result<f64, CalculatorError> {
        let tokens = Parser::parse(expression)?;
        self.result = Self::evaluate_tokens(&tokens)?;
        Ok(self.result)
    }

    pub fn get_result(&self) -> f64 {
        self.result
    }

    fn evaluate_tokens(tokens: &[Token]) -> Result<f64, CalculatorError> {
        let mut numbers = Vec::new();
        let mut operators = Vec::new();

        for token in tokens {
            match token {
                Token::Number(n) => numbers.push(*n),
                Token::Operator(op) => {
                    while let Some(Token::Operator(top_op)) = operators.last() {
                        if top_op.precedence() >= op.precedence() {
                            Self::apply_operator(&mut numbers, operators.pop().unwrap())?;
                        } else {
                            break;
                        }
                    }
                    operators.push(Token::Operator(op.clone()));
                }
                Token::LeftParen => operators.push(token.clone()),
                Token::RightParen => {
                    while let Some(op) = operators.pop() {
                        if op == Token::LeftParen {
                            break;
                        }
                        Self::apply_operator(&mut numbers, op)?;
                    }
                }
            }
        }

        while let Some(op) = operators.pop() {
            Self::apply_operator(&mut numbers, op)?;
        }

        numbers
            .pop()
            .ok_or_else(|| CalculatorError::InvalidExpression("Empty expression".to_string()))
    }

    fn apply_operator(numbers: &mut Vec<f64>, token: Token) -> Result<(), CalculatorError> {
        if let Token::Operator(op) = token {
            if numbers.len() < 2 {
                return Err(CalculatorError::InvalidExpression(
                    "Not enough operands".to_string(),
                ));
            }
            let b = numbers.pop().unwrap();
            let a = numbers.pop().unwrap();
            numbers.push(op.apply(a, b)?);
            Ok(())
        } else {
            Err(CalculatorError::InvalidExpression(
                "Expected operator".to_string(),
            ))
        }
    }
}
