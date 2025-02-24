"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";

const TextToShader: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [shaderCode, setShaderCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState("");
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const timeUniformLocationRef = useRef<WebGLUniformLocation | null>(null);
    const startTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        setPrompt("");
        setShaderCode("");
        setError("");
        const handlePopState = () => {
            console.log("Navigation detected, clearing form");
            setPrompt("");
            setShaderCode("");
            setError("");
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, []);

    const generateShader = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt");
            return;
        }
        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post("http://localhost:4000/api/generate-shader",
                { prompt },
                {
                    headers: { "Content-Type": "application/json" }
                }
            );

            setShaderCode(response.data.shaderCode);
        } catch (err) {
            setError("Error generating shader. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const render = useCallback(() => {
        if (!programRef.current || !glRef.current) return;
        const gl = glRef.current;
        const program = programRef.current;
        const timeUniformLocation = timeUniformLocationRef.current;
        const startTime = startTimeRef.current;

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000;
        if (timeUniformLocation) {
            gl.uniform1f(timeUniformLocation, elapsedTime);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animationFrameRef.current = requestAnimationFrame(render);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl");
        if (!gl) {
            setError("WebGL not supported");
            return;
        }
        glRef.current = gl;

        const createAndCompileShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) {
                setError(`Failed to create shader of type ${type}`);
                return null;
            }
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                setError(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        if (shaderCode) {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            const shaderParts = shaderCode.split("// Fragment Shader\n");
            if (shaderParts.length !== 2) {
                setError("Invalid shader code format");
                return;
            }

            const vertexShaderSource = shaderParts[0].trim();
            const fragmentShaderSource = shaderParts[1].trim();

            const compiledVertexShader = createAndCompileShader(gl.VERTEX_SHADER, vertexShaderSource);
            const compiledFragmentShader = createAndCompileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

            if (!compiledVertexShader || !compiledFragmentShader) {
                return;
            }

            const program = gl.createProgram();
            if (!program) {
                setError("Failed to create shader program");
                return;
            }

            gl.attachShader(program, compiledVertexShader);
            gl.attachShader(program, compiledFragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                setError("Shader program linking error: " + gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
                return;
            }

            if (programRef.current) {
                gl.deleteProgram(programRef.current);
            }

            programRef.current = program;

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

            timeUniformLocationRef.current = gl.getUniformLocation(program, "u_time");
            startTimeRef.current = Date.now();
            render();

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }

                if (gl && programRef.current) {
                    gl.deleteProgram(programRef.current);
                    if (positionBuffer) {
                        gl.deleteBuffer(positionBuffer);
                    }
                    glRef.current = null;
                    programRef.current = null;
                }
            };
        }
    }, [shaderCode, render]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            generateShader();
        }
    };

    const resetForm = () => {
        setPrompt("");
        setShaderCode("");
        setError("");
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <Input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your shader prompt"
                            className="flex-grow"
                            disabled={isLoading}
                        />

                        <Button
                            onClick={generateShader}
                            disabled={isLoading}
                            className="min-w-[140px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : "Generate Shader"}
                        </Button>
                        {shaderCode && (
                            <Button
                                variant="outline"
                                onClick={resetForm}
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Generated Shader Code:</h3>
                            <Textarea
                                value={isLoading ? "Generating shader code..." : shaderCode}
                                readOnly
                                className="w-full h-[300px] font-mono text-sm resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Shader Output:</h3>
                            <div className="relative w-full h-[300px]">
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={300}
                                    className="w-full h-full border border-gray-300"
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                        <div className="text-white flex flex-col items-center">
                                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                            <span>Generating shader...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TextToShader;