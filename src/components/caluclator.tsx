"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import init, { WasmCalculator } from "../../server/pkg/server";

const CalculatorButton: React.FC<{
    value: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline";
    className?: string;
}> = ({ value, onClick, variant = "default", className }) => (
    <Button variant={variant} onClick={onClick} className={cn("text-lg h-14 transition-all active:scale-95", className)}>
        {value}
    </Button>
);

const Calculator: React.FC = () => {
    const [calculator, setCalculator] = useState<WasmCalculator | null>(null);
    const [display, setDisplay] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [history, setHistory] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const initCalc = async () => {
            try {
                await init();
                const calc = new WasmCalculator();
                setCalculator(calc);
            } catch (err) {
                setError("Failed to initialize calculator");
            } finally {
                setIsLoading(false);
            }
        };
        initCalc();
    }, []);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const key = e.key;
            if (key.match(/[0-9+\-*/().]/) || key === "Enter" || key === "Backspace") {
                if (key === "Enter") {
                    e.preventDefault();
                    handleCalculate();
                } else if (key === "Backspace") {
                    if (document.activeElement !== inputRef.current) {
                        e.preventDefault();
                        handleBackspace();
                    }
                } else {
                    if (document.activeElement !== inputRef.current) {
                        e.preventDefault();
                        handleButtonClick(key);
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [display, calculator]);

    const handleCalculate = () => {
        if (!calculator) {
            setError("Calculator not initialized. Please refresh the page.");
            return;
        }
        if (!display) {
            return;
        }

        try {
            const result = calculator.evaluate(display);
            const historyEntry = `${display} = ${result}`;

            setHistory(prev => {
                const updatedHistory = [...prev, historyEntry];
                return updatedHistory;
            });

            setDisplay(result.toString());
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid expression");
        }
    };

    const handleButtonClick = (value: string) => {
        setDisplay((prev) => prev + value);
        setError("");
    };

    const handleBackspace = () => {
        setDisplay((prev) => prev.slice(0, -1));
        setError("");
    };

    const handleClear = () => {
        setDisplay("");
        setError("");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplay(e.target.value);
        setError("");
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        if (/^[0-9+\-*/().]*$/.test(pastedText)) {
            setDisplay(prev => prev + pastedText);
        } else {
            e.preventDefault();
            setError("Pasted text contains invalid characters");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const buttons = [
        ["7", "8", "9", "/"],
        ["4", "5", "6", "*"],
        ["1", "2", "3", "-"],
        ["0", "(", ")", "+"],
    ];

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row gap-6">
            <Card className="p-6 shadow-lg flex-1">
                <div className="space-y-4">
                    <div>
                        <Input
                            ref={inputRef}
                            type="text"
                            value={display}
                            onChange={handleInputChange}
                            onPaste={handlePaste}
                            className="text-right text-2xl h-14"
                            placeholder="0"
                            aria-label="Calculator display"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCalculate();
                                }
                            }}
                        />
                        {error && (
                            <p className="text-destructive text-sm mt-1" role="alert">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {buttons.map((row, i) => (
                            <React.Fragment key={i}>
                                {row.map((btn) => (
                                    <CalculatorButton
                                        key={btn}
                                        value={btn}
                                        onClick={() => handleButtonClick(btn)}
                                        variant={/[+\-*/]/.test(btn) ? "secondary" : "outline"}
                                    />
                                ))}
                            </React.Fragment>
                        ))}

                        <CalculatorButton value="C" onClick={handleClear} variant="secondary" />
                        <CalculatorButton
                            value="⌫"
                            onClick={handleBackspace}
                            variant="secondary"
                            className="bg-red-500 hover:bg-red-600 text-white"
                        />

                        <CalculatorButton
                            value="="
                            onClick={handleCalculate}
                            className="col-span-2 bg-primary hover:bg-primary/90"
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-6 shadow-lg w-full sm:w-64 h-min">
                <h2 className="text-sm font-medium mb-4">History</h2>
                {history.length > 0 ? (
                    <div className="space-y-2 text-sm text-muted-foreground">
                        {history.slice(-5).map((entry, i) => (
                            <div key={i} className="py-1 border-b border-gray-100 last:border-0">
                                {entry}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No calculations yet</p>
                )}
            </Card>
        </div>
    );
};

export default Calculator;