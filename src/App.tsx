import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import CalculatorComponent from "./components/caluclator";
import TextToShader from "./components/text-to-shader";

function App() {
    const [activeTab, setActiveTab] = useState("calculator");

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto pt-8 pb-16 px-4 sm:px-6">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <div className="border-b">
                            <TabsList className="w-full flex justify-center bg-transparent p-0">
                                <TabsTrigger
                                    value="calculator"
                                    className="flex-1 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all"
                                >
                                    Calculator
                                </TabsTrigger>
                                <TabsTrigger
                                    value="shader"
                                    className="flex-1 py-4 rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 transition-all"
                                >
                                    Text to Shader
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6">
                            <TabsContent value="calculator" className="mt-0">
                                <CalculatorComponent />
                            </TabsContent>
                            <TabsContent value="shader" className="mt-0">
                                <TextToShader />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default App;
