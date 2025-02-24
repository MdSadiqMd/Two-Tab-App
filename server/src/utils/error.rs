#[derive(Debug)]
pub enum CalculatorError {
    InvalidExpression(String),
    DivisionByZero,
    ParseError(String),
}

impl std::fmt::Display for CalculatorError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            CalculatorError::InvalidExpression(msg) => write!(f, "Invalid expression: {}", msg),
            CalculatorError::DivisionByZero => write!(f, "Division by zero"),
            CalculatorError::ParseError(msg) => write!(f, "Parse error: {}", msg),
        }
    }
}
