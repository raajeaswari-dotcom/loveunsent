"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, CheckCircle2, Plus, Minus, Trash2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SingleLetterForm } from "@/components/SingleLetterForm";
import { useCart } from "@/context/CartContext";
import { mockApi } from "@/lib/mockApi";

// Initial state for a single letter
const initialLetterState = {
    message: "",
    paperId: "ordinary",
    addonIds: [],
    handwritingStyle: "Standard",
    inkColor: "Blue",
    recipientAddressId: null,
};

function CustomizeBundleContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const countParam = searchParams.get("count");

    const { addItem } = useCart();

    // State
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [letters, setLetters] = useState<any[]>([]);
    const [papers, setPapers] = useState<any[]>([]);
    const [addons, setAddons] = useState<any[]>([]);
    const [isReviewing, setIsReviewing] = useState(false);

    // Initialize letters
    useEffect(() => {
        const initialCount = countParam ? parseInt(countParam) : 2;
        const initialLetters = Array(initialCount)
            .fill(null)
            .map(() => ({ ...initialLetterState }));
        setLetters(initialLetters);
    }, [countParam]);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            const [p, ad] = await Promise.all([
                mockApi.getProducts(),
                mockApi.getAddons(),
            ]);
            setPapers(p);
            setAddons(ad);
            setLoading(false);
        };
        fetchData();
    }, []);

    const updateLetterState = (index: number, updates: any) => {
        setLetters((prev) => {
            const newLetters = [...prev];
            newLetters[index] = { ...newLetters[index], ...updates };
            return newLetters;
        });
    };

    const addLetter = () => {
        if (letters.length < 10) {
            setLetters((prev) => [...prev, { ...initialLetterState }]);
            setActiveTab(letters.length); // Switch to new letter
            setIsReviewing(false);
        }
    };

    const removeLetter = (index: number) => {
        if (letters.length > 2) {
            setLetters((prev) => prev.filter((_, i) => i !== index));
            if (activeTab >= index && activeTab > 0) {
                setActiveTab((prev) => prev - 1);
            }
        } else {
            alert("A bundle must have at least 2 letters.");
        }
    };

    const isLetterValid = (letter: any) => {
        return (
            letter.message?.trim() &&
            letter.paperId &&
            letter.recipientAddressId
        );
    };

    const handleNext = () => {
        const currentLetter = letters[activeTab];
        if (!isLetterValid(currentLetter)) {
            alert("Please complete all fields for this letter before proceeding.");
            return;
        }

        if (activeTab < letters.length - 1) {
            setActiveTab((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            setIsReviewing(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handlePrev = () => {
        if (isReviewing) {
            setIsReviewing(false);
            setActiveTab(letters.length - 1);
        } else if (activeTab > 0) {
            setActiveTab((prev) => prev - 1);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleAddToCart = () => {
        // Final Validation
        for (let i = 0; i < letters.length; i++) {
            if (!isLetterValid(letters[i])) {
                alert(`Please complete details for Letter ${i + 1}.`);
                setIsReviewing(false);
                setActiveTab(i);
                return;
            }
        }

        // Add all letters to cart
        letters.forEach((letter, index) => {
            const paperPrice =
                papers.find((p) => p.id === letter.paperId)?.price || 0;
            const addonsPrice = letter.addonIds.reduce((sum: number, id: string) => {
                const addon = addons.find((a) => a.id === id);
                return sum + (addon?.price || 0);
            }, 0);
            const totalPrice = paperPrice + addonsPrice + 299; // Base service fee assumption

            addItem({
                id: `bundle_${Date.now()}_${index}`,
                type: "letter",
                name: `Bundle Letter ${index + 1} of ${letters.length}`,
                price: totalPrice,
                quantity: 1,
                details: {
                    message: letter.message,
                    paperId: letter.paperId,
                    addonIds: letter.addonIds,
                    inkColor: letter.inkColor,
                    recipientAddressId: letter.recipientAddressId,
                    occasion: "Bundle",
                },
            });
        });

        router.push("/checkout");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
                    <p className="text-muted-foreground font-serif">
                        Preparing your bundle...
                    </p>
                </div>
            </div>
        );
    }

    const activeLetter = letters[activeTab];

    // Calculate Total Price
    const calculateTotal = () => {
        return letters.reduce((total, letter) => {
            const paperPrice = papers.find((p) => p.id === letter.paperId)?.price || 0;
            const addonsPrice = letter.addonIds.reduce((sum: number, id: string) => {
                const addon = addons.find((a) => a.id === id);
                return sum + (addon?.price || 0);
            }, 0);
            return total + paperPrice + addonsPrice + 299;
        }, 0);
    };

    return (
        <div className="min-h-screen bg-[#F5EFE7]">
            <div className="container max-w-6xl py-8 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
                        Customize Your Bundle
                    </h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Personalize each of your letters below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Letter Tabs */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="p-4 bg-white border-2 border-gray-200 shadow-md sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Your Letters</h3>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {letters.length}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                                {letters.map((letter, idx) => {
                                    const isValid = isLetterValid(letter);
                                    return (
                                        <div key={idx} className="flex items-center gap-2 group">
                                            <button
                                                onClick={() => {
                                                    setActiveTab(idx);
                                                    setIsReviewing(false);
                                                }}
                                                className={`flex-1 text-left px-3 py-3 rounded-lg transition-all flex items-center justify-between ${activeTab === idx && !isReviewing
                                                    ? "bg-[rgb(81,19,23)] text-white font-bold shadow-md"
                                                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span className="truncate">Letter {idx + 1}</span>
                                                {isValid ? (
                                                    <CheckCircle2
                                                        className={`w-4 h-4 flex-shrink-0 ${activeTab === idx && !isReviewing
                                                            ? "text-white"
                                                            : "text-green-600"
                                                            }`}
                                                    />
                                                ) : (
                                                    <AlertCircle
                                                        className={`w-4 h-4 flex-shrink-0 ${activeTab === idx && !isReviewing
                                                            ? "text-white"
                                                            : "text-gray-300"
                                                            }`}
                                                    />
                                                )}
                                            </button>
                                            {letters.length > 2 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeLetter(idx);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Letter"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    onClick={addLetter}
                                    disabled={letters.length >= 10}
                                    className="w-full border-dashed border-2 border-gray-300 hover:border-[rgb(81,19,23)] hover:text-[rgb(81,19,23)]"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Letter
                                </Button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setIsReviewing(true)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${isReviewing
                                        ? "bg-[rgb(81,19,23)] text-white font-bold shadow-md"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    <span>Review Bundle</span>
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content - Form or Review */}
                    <div className="lg:col-span-3">
                        <Card className="p-6 md:p-8 border-2 border-gray-200 shadow-lg bg-white">
                            {isReviewing ? (
                                <div className="space-y-8">
                                    <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">
                                        Review Your Bundle
                                    </h2>
                                    <div className="space-y-6">
                                        {letters.map((letter, idx) => (
                                            <div
                                                key={idx}
                                                className="border rounded-lg p-4 bg-gray-50 space-y-2"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-bold text-lg">Letter {idx + 1}</h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setActiveTab(idx);
                                                            setIsReviewing(false);
                                                        }}
                                                        className="text-[rgb(81,19,23)] hover:text-[#4A2424]"
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Recipient:</span>{" "}
                                                    {letter.recipientAddressId ? 'Address Selected' : 'Not Selected'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Paper:</span>{" "}
                                                    {papers.find((p) => p.id === letter.paperId)?.name ||
                                                        "Not selected"}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-semibold">Ink:</span> {letter.inkColor}
                                                </p>
                                                {letter.addonIds.length > 0 && (
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-semibold">Add-ons:</span> {letter.addonIds.length} selected
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-[#C4A68A]/20 rounded-lg p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-lg font-medium text-gray-700">
                                                Total Bundle Price
                                            </span>
                                            <span className="text-3xl font-bold text-[rgb(81,19,23)]">
                                                ₹{calculateTotal()}
                                            </span>
                                        </div>
                                        <Button
                                            onClick={handleAddToCart}
                                            className="w-full h-14 rounded-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] text-white font-bold text-lg shadow-lg"
                                        >
                                            Add Bundle to Cart
                                        </Button>
                                    </div>
                                    <div className="flex justify-start">
                                        <Button
                                            variant="outline"
                                            onClick={handlePrev}
                                            className="px-6"
                                        >
                                            Back to Editing
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                activeLetter && (
                                    <SingleLetterForm
                                        state={{
                                            message: activeLetter.message,
                                            paperId: activeLetter.paperId,
                                            addonIds: activeLetter.addonIds,
                                        }}
                                        updateState={(updates) =>
                                            updateLetterState(activeTab, updates)
                                        }
                                        papers={papers}
                                        addons={addons}
                                        inkColor={activeLetter.inkColor}
                                        setInkColor={(color) =>
                                            updateLetterState(activeTab, { inkColor: color })
                                        }
                                        selectedAddressId={activeLetter.recipientAddressId}
                                        onSelectAddress={(addressId) =>
                                            updateLetterState(activeTab, { recipientAddressId: addressId })
                                        }
                                        onNext={handleNext}
                                        onPrev={handlePrev}
                                        isFirst={activeTab === 0}
                                        isLast={activeTab === letters.length - 1}
                                    />
                                )
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CustomizeBundlePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CustomizeBundleContent />
        </Suspense>
    );
}
