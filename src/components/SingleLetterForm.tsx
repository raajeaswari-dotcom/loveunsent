"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { BundleLetterForm } from "@/components/BundleLetterForm";
import { MessageEditor } from "@/components/MessageEditor";
import { PaperSelector } from "@/components/PaperSelector";
import { AddonGrid } from "@/components/AddonGrid";
import { AddressSelector } from "@/components/AddressSelector";

interface SingleLetterFormProps {
    state: any;
    updateState: (updates: any) => void;
    papers: any[];
    addons: any[];
    inkColor: string;
    setInkColor: (color: string) => void;
    selectedAddressId: string | null;
    onSelectAddress: (addressId: string | null) => void;
    onNext?: () => void;
    onPrev?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
    addonsEnabled?: boolean;
    isBundle?: boolean;
    bundleData?: any;
    onUpdateBundle?: (data: any) => void;
}

export function SingleLetterForm({
    state,
    updateState,
    papers,
    addons,
    inkColor,
    setInkColor,
    selectedAddressId,
    onSelectAddress,
    onNext,
    onPrev,
    isFirst,
    isLast,
    addonsEnabled = true,
    isBundle = false,
    bundleData,
    onUpdateBundle
}: SingleLetterFormProps) {
    const [userAddresses, setUserAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // Fetch user addresses
    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await fetch('/api/user/addresses');
            if (response.ok) {
                const result = await response.json();
                setUserAddresses(result.data?.addresses || []);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const toggleAddon = (id: string) => {
        if (id === "none") {
            updateState({ addonIds: [] });
            return;
        }

        const currentAddons = state.addonIds || [];
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
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070&auto=format&fit=crop",
        },
        ...addons
    ];

    return (
        <div className="space-y-8">
            {/* Message / Bundle Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {isBundle ? "1. Your Letters" : "1. Message"}
                </h2>
                {isBundle && onUpdateBundle ? (
                    <BundleLetterForm
                        initialData={bundleData}
                        onUpdate={onUpdateBundle}
                        basePrice={0} // Handled in parent
                    />
                ) : (
                    <MessageEditor
                        value={state.message}
                        onChange={(val) => updateState({ message: val })}
                    />
                )}
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
            {addonsEnabled && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Add-ons</h2>
                    <AddonGrid
                        addons={displayAddons}
                        selectedIds={(state.addonIds && state.addonIds.length > 0) ? state.addonIds : ["none"]}
                        onToggle={toggleAddon}
                    />
                </section>
            )}

            {/* Recipient Details Section */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {addonsEnabled ? "5." : "4."} Recipient Details
                </h2>
                {loadingAddresses ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading addresses...</p>
                    </div>
                ) : (
                    <AddressSelector
                        selectedAddressId={selectedAddressId}
                        onSelectAddress={onSelectAddress}
                        userAddresses={userAddresses}
                        onAddressesChange={fetchAddresses}
                    />
                )}
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
