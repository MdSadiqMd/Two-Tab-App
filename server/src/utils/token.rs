use super::error::CalculatorError;

#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    Number(f64),
    Operator(Operator),
    LeftParen,
    RightParen,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Operator {
    Add,
    Subtract,
    Multiply,
    Divide,
}

impl Operator {
    pub fn precedence(&self) -> u8 {
        match self {
            Operator::Add | Operator::Subtract => 1,
            Operator::Multiply | Operator::Divide => 2,
        }
    }

    pub fn apply(&self, a: f64, b: f64) -> Result<f64, CalculatorError> {
        match self {
            Operator::Add => Ok(a + b),
            Operator::Subtract => Ok(a - b),
            Operator::Multiply => Ok(a * b),
            Operator::Divide => {
                if b == 0.0 {
                    Err(CalculatorError::DivisionByZero)
                } else {
                    Ok(a / b)
                }
            }
        }
    }
}
