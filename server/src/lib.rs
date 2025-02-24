mod utils;
pub use utils::caluclator::Calculator;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmCalculator(Calculator);

#[wasm_bindgen]
impl WasmCalculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        WasmCalculator(Calculator::new())
    }

    #[wasm_bindgen]
    pub fn evaluate(&mut self, expression: &str) -> Result<f64, JsValue> {
        self.0
            .evaluate(expression)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    #[wasm_bindgen]
    pub fn get_result(&self) -> f64 {
        self.0.get_result()
    }
}
