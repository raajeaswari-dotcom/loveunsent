"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SingleLetterForm } from "@/components/SingleLetterForm";
import { useCustomization } from "@/context/CustomizationContext";
import { useCart } from "@/context/CartContext";
import { usePrice } from "@/hooks/usePrice";
import { mockApi } from "@/lib/mockApi";

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
  const [loading, setLoading] = useState(true);
  const [occasion, setOccasion] = useState<string>("");
  const [inkColor, setInkColor] = useState<string>("Blue");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");

  // Contexts
  const { state, updateState } = useCustomization();
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

      // Set default paper to Ordinary
      if (!state.paperId) {
        updateState({ paperId: "ordinary" });
      }
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

  const handleAddToCart = () => {
    if (!state.message?.trim()) {
      alert("Please write your message.");
      return;
    }
    if (!state.paperId) {
      alert("Please select a paper.");
      return;
    }
    if (!recipientName.trim() || !recipientAddress.trim()) {
      alert("Please complete recipient details.");
      return;
    }

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

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Left Side - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 md:p-8 border-2 border-gray-200 shadow-lg bg-white">
              <SingleLetterForm
                state={state}
                updateState={updateState}
                papers={papers}
                addons={addons}
                inkColor={inkColor}
                setInkColor={setInkColor}
                recipientName={recipientName}
                setRecipientName={setRecipientName}
                recipientAddress={recipientAddress}
                setRecipientAddress={setRecipientAddress}
              />
            </Card>
          </div>

          {/* RIGHT SIDEBAR SUMMARY */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 border-2 border-gray-200 shadow-lg bg-white">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
                <Sparkles className="w-5 h-5 text-[rgb(81,19,23)]" />
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
                    <span className="text-2xl font-bold text-[rgb(81,19,23)]">
                      ₹{total}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full h-12 rounded-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] text-white font-bold text-lg"
              >
                Add to Cart
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
