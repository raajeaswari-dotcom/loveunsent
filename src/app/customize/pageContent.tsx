"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaperSelector } from "@/components/PaperSelector";
import { MessageEditor } from "@/components/MessageEditor";
import { AddonGrid } from "@/components/AddonGrid";
import { ReviewSection } from "@/components/ReviewSection";
import { useCustomization } from "@/context/CustomizationContext";
import { useCart } from "@/context/CartContext";
import { usePrice } from "@/hooks/usePrice";
import { mockApi } from "@/lib/mockApi";

// Steps of the customization flow
const STEPS = [
  "Message",
  "Paper",
  "Ink Color",
  "Recipient Details",
  "Add-ons",
  "Review",
];

// Helper to format occasion names
const formatOccasionName = (occasion: string): string => {
  const occasionMap: { [key: string]: string } = {
    love: "Love Letters",
    birthday: "Birthday Wishes",
    thankyou: "Thank You Notes",
    apology: "Apologies",
    congrats: "Congratulations",
    farewell: "Farewells",
    wedding: "Wedding Vows",
    classic: "Classic",
    "open-when": "Open When",
    unsent: "Unsent",
  };
  return (
    occasionMap[occasion] ||
    occasion.charAt(0).toUpperCase() + occasion.slice(1)
  );
};

export default function CustomizePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI state
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [occasion, setOccasion] = useState<string>("");
  const [inkColor, setInkColor] = useState<string>("Blue");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");

  // Contexts
  const { state, updateState, canProceed } = useCustomization();
  const { addItem } = useCart();
  const { total, breakdown } = usePrice();

  // Data fetched from mock API
  const [papers, setPapers] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);

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

    const occasionParam = searchParams.get("occasion");
    const typeParam = searchParams.get("type");
    if (occasionParam) {
      setOccasion(formatOccasionName(occasionParam));
    } else if (typeParam) {
      setOccasion(formatOccasionName(typeParam));
    }
  }, [searchParams]);

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const toggleAddon = (id: string) => {
    const currentAddons = state.addonIds || [];
    const newAddons = currentAddons.includes(id)
      ? currentAddons.filter((a) => a !== id)
      : [...currentAddons, id];
    updateState({ addonIds: newAddons });
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    if (currentStep === 3) {
      if (!recipientName.trim() || !recipientAddress.trim()) {
        alert("Please complete recipient details before proceeding.");
        return;
      }
      setCurrentStep((prev) => prev + 1);
      return;
    }
    if (!canProceed(currentStep)) {
      alert("Please complete this step before proceeding.");
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      addItem({
        id: `custom_${Date.now()}`,
        type: "letter",
        name: "Custom Handwritten Letter",
        price: total,
        quantity: 1,
        details: {
          ...state,
          breakdown,
          occasion,
          inkColor,
          recipientName,
          recipientAddress,
        },
      });
      router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground font-serif">
            Preparing your canvas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE7]">
      <div className="container max-w-6xl py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900">
            Craft Your Letter
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Every detail matters. Let's create something beautiful together.
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-[#5C2E2E] transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {STEPS.map((step, idx) => (
                <div key={step} className="flex flex-col items-center">
                  <button
                    onClick={() => idx <= currentStep && setCurrentStep(idx)}
                    disabled={idx > currentStep}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-sm font-semibold mb-2 ${
                      idx < currentStep
                        ? "bg-[#5C2E2E] border-[#5C2E2E] text-white"
                        : idx === currentStep
                        ? "bg-white border-[#5C2E2E] text-[#5C2E2E] scale-110 shadow-lg"
                        : "bg-white border-gray-300 text-gray-400"
                    } ${
                      idx <= currentStep
                        ? "cursor-pointer hover:scale-105"
                        : "cursor-not-allowed"
                    }`}
                  >
                    {idx < currentStep ? "✓" : idx + 1}
                  </button>
                  <span
                    className={`text-xs md:text-sm font-medium transition-colors ${
                      idx <= currentStep ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 border-2 border-gray-200 shadow-lg bg-white">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {STEPS[currentStep]}
                </h2>
              </div>

              <div>
                {currentStep === 0 && (
                  <MessageEditor
                    value={state.message}
                    onChange={(val) => updateState({ message: val })}
                  />
                )}

                {currentStep === 1 && (
                  <PaperSelector
                    papers={papers}
                    selectedId={state.paperId || ""}
                    onSelect={(id) => updateState({ paperId: id })}
                  />
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Choose Ink Color
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["Blue", "Black", "Red", "Green", "Purple", "Brown"].map(
                        (color) => (
                          <button
                            key={color}
                            onClick={() => setInkColor(color)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              inkColor === color
                                ? "border-[#5C2E2E] bg-[#5C2E2E]/10"
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
                                      : color === "Red"
                                      ? "#DC2626"
                                      : color === "Green"
                                      ? "#16A34A"
                                      : color === "Purple"
                                      ? "#9333EA"
                                      : "#92400E",
                                }}
                              />
                              <span className="font-medium text-gray-900">
                                {color}
                              </span>
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Recipient Details
                    </h3>
               

    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C2E2E] focus:ring-[#5C2E2E]"
                      />

                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C2E2E] focus:ring-[#5C2E2E]"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <AddonGrid
                    addons={addons}
                    selectedIds={state.addonIds || []}
                    onToggle={toggleAddon}
                  />
                )}

                {currentStep === 5 && (
                  <ReviewSection
                    occasion={occasion}
                    inkColor={inkColor}
                    recipientName={recipientName}
                    recipientAddress={recipientAddress}
                    addons={addons.filter((a) =>
                      (state.addonIds || []).includes(a.id)
                    )}
                    total={total}
                    message={state.message}
                    handwritingImageUrl={state.handwritingImageUrl}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === STEPS.length - 1 ? "Place Order" : "Next"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* RIGHT SIDEBAR SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 border-2 border-gray-200 shadow-lg bg-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <Sparkles className="w-5 h-5 text-[#5C2E2E]" />
                <span>Your Letter</span>
              </h3>

              <div className="space-y-3 text-sm mb-6">
                {occasion && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Occasion</span>
                    <span className="font-medium text-gray-900">
                      {occasion}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Paper</span>
                  <span className="font-medium text-gray-900">
                    {papers.find((p) => p.id === state.paperId)?.name || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Ink Color</span>
                  <span className="font-medium text-gray-900">{inkColor}</span>
                </div>

                {state.addonIds && state.addonIds.length > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Add-ons</span>
                    <span className="font-medium text-gray-900">
                      {state.addonIds.length} selected
                    </span>
                  </div>
                )}

                <div className="bg-[#C4A68A]/20 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total</span>
                    <span className="text-2xl font-bold text-[#5C2E2E]">
                      ₹{total}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
