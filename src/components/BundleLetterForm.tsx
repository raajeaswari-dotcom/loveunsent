
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface BundleLetterFormProps {
    onUpdate: (data: any) => void;
    initialData?: any;
    basePrice: number;
}

export const BundleLetterForm: React.FC<BundleLetterFormProps> = ({ onUpdate, initialData, basePrice }) => {
    const [numLetters, setNumLetters] = useState<number>(initialData?.numLetters || 5);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [letters, setLetters] = useState<Array<{ content: string }>>(
        initialData?.letters || Array(5).fill({ content: "" })
    );

    // Update letters array size when numLetters changes
    useEffect(() => {
        if (letters.length !== numLetters) {
            const newLetters = [...letters];
            if (numLetters > letters.length) {
                // Add new empty letters
                for (let i = letters.length; i < numLetters; i++) {
                    newLetters.push({ content: "" });
                }
            } else {
                // Truncate
                newLetters.length = numLetters;
            }
            setLetters(newLetters);
            // Reset index if out of bounds
            if (currentIndex >= numLetters) {
                setCurrentIndex(0);
            }
        }
    }, [numLetters]);

    // Handle content change for current letter
    const handleContentChange = (content: string) => {
        const newLetters = [...letters];
        newLetters[currentIndex] = { ...newLetters[currentIndex], content };
        setLetters(newLetters);

        // Notify parent
        onUpdate({
            isBundle: true,
            letters: newLetters,
            numLetters,
            price: calcPrice(numLetters)
        });
    };

    const calcPrice = (count: number) => {
        // Example pricing logic: Base price * count? 
        // Or discount for bundles? 
        // Screenshot showed "5 Letters - 1999". If base is 299/349/499... 
        // Let's assume a simplified bundle pricing or just sum.
        // For now, let's use a bundled price estimate or pass a prop. 
        // If the user didn't specify, I'll assume standard price * count.
        // But screenshot says 5 letters = 1999. ~400 per letter. 
        // "Open When" base price was 499. So 5 * 499 = 2495. So 1999 is a deal.

        // Let's implement tiered pricing or just a simple multiplier for now.
        // Or fixed bundle options. 
        return count * 400; // Simplified average for now
    };

    const nextLetter = () => {
        if (currentIndex < numLetters - 1) setCurrentIndex(prev => prev + 1);
    };

    const prevLetter = () => {
        if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Number of Letters Selection */}
            <div className="bg-[#F3E9DD] p-6 rounded-2xl border-2 border-[#2C1B13]/10 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-[#2C1B13] font-bold text-lg">No. of letters</label>
                </div>
                <Select
                    value={numLetters.toString()}
                    onValueChange={(val) => setNumLetters(parseInt(val))}
                >
                    <SelectTrigger className="w-full bg-transparent border-b-2 border-[#2C1B13]/20 rounded-none h-12 px-0 focus:ring-0 text-lg">
                        <SelectValue placeholder="Select number of letters" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2">2 Letters</SelectItem>
                        <SelectItem value="3">3 Letters</SelectItem>
                        <SelectItem value="4">4 Letters</SelectItem>
                        <SelectItem value="5">5 Letters</SelectItem>
                        <SelectItem value="6">6 Letters</SelectItem>
                        <SelectItem value="7">7 Letters</SelectItem>
                        <SelectItem value="8">8 Letters</SelectItem>
                        <SelectItem value="9">9 Letters</SelectItem>
                        <SelectItem value="10">10 Letters</SelectItem>
                        <SelectItem value="12">12 Letters</SelectItem>
                    </SelectContent>
                </Select>
                <div className="text-right mt-4">
                    <span className="text-[#2C1B13] font-bold text-xl">Price: ₹{calcPrice(numLetters).toFixed(2)}</span>
                </div>
            </div>

            {/* Writing Area */}
            <div className="bg-[#F3E9DD] p-6 rounded-2xl border-2 border-[#2C1B13]/10 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-[#2C1B13] font-bold text-lg">Your Letters</h2>
                    <p className="text-center text-[#2C1B13]/70 font-medium my-2">Letter {currentIndex + 1} of {numLetters}</p>
                </div>

                <Textarea
                    placeholder="Open when..."
                    className="min-h-[200px] bg-white/50 border-2 border-[#2C1B13]/10 rounded-xl p-4 text-lg resize-none focus:border-[#2C1B13]/30 transition-all font-serif"
                    value={letters[currentIndex]?.content || ""}
                    onChange={(e) => handleContentChange(e.target.value)}
                />

                <div className="flex justify-between mt-6">
                    <Button
                        variant="ghost"
                        onClick={prevLetter}
                        disabled={currentIndex === 0}
                        className="text-[#2C1B13]/60 hover:text-[#2C1B13] hover:bg-black/5"
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={nextLetter}
                        disabled={currentIndex === numLetters - 1}
                        className="bg-[#511317] text-white hover:bg-[#3d0e11] rounded-full px-8"
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Navigation Bubbles (Optional visual aid) */}
            <div className="flex justify-center gap-2 flex-wrap">
                {letters.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${idx === currentIndex ? 'bg-[#511317] scale-125' : 'bg-[#2C1B13]/20 hover:bg-[#2C1B13]/40'
                            }`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>
        </div>
    );
};
