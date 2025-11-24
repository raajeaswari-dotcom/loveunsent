"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { MessageEditor } from "@/components/MessageEditor";
import { PaperSelector } from "@/components/PaperSelector";
import { AddonGrid } from "@/components/AddonGrid";

interface SingleLetterFormProps {
    state: any;
    updateState: (updates: any) => void;
    papers: any[];
    addons: any[];
    inkColor: string;
    setInkColor: (color: string) => void;
    recipientName: string;
    setRecipientName: (name: string) => void;
    recipientAddress: string;
    setRecipientAddress: (address: string) => void;
    onNext?: () => void;
    onPrev?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
}

export function SingleLetterForm({
    state,
    updateState,
    papers,
    addons,
    inkColor,
    setInkColor,
    recipientName,
    setRecipientName,
    recipientAddress,
    setRecipientAddress,
    onNext,
    onPrev,
    isFirst,
    isLast,
}: SingleLetterFormProps) {
    const toggleAddon = (id: string) => {
        if (id === "none") {
            updateState({ addonIds: [] });
            return;
        }

        const currentAddons = state.addonIds || [];
        // If currently selecting an addon, ensure "none" is not active (which is implied by having items)
        // If deselecting the last addon, we effectively go back to "none" (empty list)

        const newAddons = currentAddons.includes(id)
            ? currentAddons.filter((a: string) => a !== id)
            : [...currentAddons, id];

        updateState({ addonIds: newAddons });
    };

    // Prepare addons list with "No Add-ons" option
    const displayAddons = [
        {
            id: "none",
            name: "No Add-ons",
            price: 0,
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop", // Generic simple image or placeholder
        },
        ...addons
    ];

    return (
        <div className="space-y-8">
            {/* Message Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Message</h2>
                <MessageEditor
                    value={state.message}
                    onChange={(val) => updateState({ message: val })}
                />
            </section>

            {/* Paper Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Paper</h2>
                <PaperSelector
                    papers={papers}
                    selectedId={state.paperId || ""}
                    onSelect={(id) => updateState({ paperId: id })}
                />
            </section>

            {/* Ink Color Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Ink Color</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {["Blue", "Black", "Red"].map((color) => (
                        <button
                            key={color}
                            onClick={() => setInkColor(color)}
                            className={`p-4 rounded-lg border-2 transition-all ${inkColor === color
                                ? "border-[rgb(81,19,23)] bg-[rgb(81,19,23)]/10"
                                : "border-gray-300 hover:border-gray-400"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                                    style={{
                                        backgroundColor:
                                            color === "Blue"
                                                ? "#1E3A8A"
                                                : color === "Black"
                                                    ? "#000000"
                                                    : "#DC2626",
                                    }}
                                />
                                <span className="font-medium text-gray-900">{color}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Add-ons Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Add-ons</h2>
                <AddonGrid
                    addons={displayAddons}
                    selectedIds={(state.addonIds && state.addonIds.length > 0) ? state.addonIds : ["none"]}
                    onToggle={toggleAddon}
                />
            </section>

            {/* Recipient Details Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    5. Recipient Details
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(81,19,23)] focus:ring-[rgb(81,19,23)] p-2 border"
                            placeholder="Recipient's Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(81,19,23)] focus:ring-[rgb(81,19,23)] p-2 border"
                            placeholder="Full Address"
                        />
                    </div>
                </div>
            </section>

            {/* Navigation Buttons */}
            {(onNext || onPrev) && (
                <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                    {onPrev && !isFirst ? (
                        <button
                            onClick={onPrev}
                            className="px-6 py-2 border-2 border-gray-300 rounded-full text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Previous Letter
                        </button>
                    ) : (
                        <div /> /* Spacer */
                    )}

                    {onNext && (
                        <button
                            onClick={onNext}
                            className="px-8 py-2 bg-[rgb(81,19,23)] text-white rounded-full font-bold hover:bg-[#4A2424] transition-colors shadow-lg"
                        >
                            {isLast ? "Review Bundle" : "Save & Next Letter"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
