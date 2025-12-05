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

  // Contexts
  const { state, updateState } = useCustomization();
  const { addItem } = useCart();
  const { total, breakdown } = usePrice();

  // Data fetched from mock API
  const [papers, setPapers] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [addonsEnabled, setAddonsEnabled] = useState(true);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [bundleData, setBundleData] = useState<any>({ numLetters: 5, letters: Array(5).fill({ content: "" }) });
  const [bundlePrice, setBundlePrice] = useState(0);

  // Derived state
  const isBundle = selectedCollection ? ["open-when", "unsent"].includes(selectedCollection.slug) : false;

  const addonPrice = state.addonIds?.reduce((sum: number, id: string) => {
    const addon = addons.find(a => a.id === id);
    return sum + (addon ? addon.price : 0);
  }, 0) || 0;

  const displayTotal = isBundle ? (bundlePrice + addonPrice) : total;

  useEffect(() => {
    const fetchData = async () => {
      const [p, ad, settingsResponse, collectionsResponse] = await Promise.all([
        mockApi.getProducts(),
        mockApi.getAddons(),
        fetch('/api/system-settings').then(res => res.json()),
        fetch('/api/collections').then(res => res.json())
      ]);
      setPapers(p);
      setAddons(ad);
      if (settingsResponse?.data?.settings) {
        setAddonsEnabled(settingsResponse.data.settings.addonsEnabled ?? true);
      }
      if (collectionsResponse?.success && collectionsResponse?.data?.collections) {
        setCollections(collectionsResponse.data.collections);
      }
      setLoading(false);

      // Check if we're in edit mode
      const isEditMode = searchParams.get("edit") === "true";
      if (isEditMode) {
        const editingOrder = localStorage.getItem('editingOrder');
        if (editingOrder) {
          const orderData = JSON.parse(editingOrder);
          // Pre-fill the form with existing order data
          updateState({
            message: orderData.details?.message || "",
            paperId: orderData.details?.paperId || "ordinary",
            addonIds: orderData.details?.addonIds || [],
            recipientAddressId: orderData.details?.recipientAddressId || null,
          });
          setInkColor(orderData.details?.inkColor || "Blue");
          setOccasion(orderData.details?.occasion || "");
          // Check if it was a bundle and restore bundle data
          if (orderData.details?.isBundle && orderData.details?.bundleData) {
            setBundleData(orderData.details.bundleData);
          }

          // Clear the editing order from localStorage
          localStorage.removeItem('editingOrder');
        }
      } else {
        // Set default paper to Ordinary for new orders
        if (!state.paperId) {
          updateState({ paperId: "ordinary" });
        }
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // If bundle mode, create initial letters array if not set
    if (isBundle && (!bundleData.letters || bundleData.letters.length === 0)) {
      setBundleData({ numLetters: 5, letters: Array(5).fill({ content: "" }) });
      setBundlePrice(5 * 400);
    }
  }, [isBundle]);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam && collections.length > 0) {
      const found = collections.find((c: any) => c.slug === typeParam);
      if (found) {
        setSelectedCollection(found);
        setOccasion(found.name);
      }
    } else {
      const occasionParam = searchParams.get("occasion");
      if (occasionParam) {
        setOccasion(formatOccasionName(occasionParam));
      }
    }
  }, [searchParams, collections]);

  const handleAddToCart = () => {
    // Validate message or bundle content
    if (isBundle) {
      const hasContent = bundleData.letters.some((l: any) => l.content.trim().length > 0);
      if (!hasContent) {
        alert('❌ Please write at least one letter.');
        return;
      }
    } else {
      if (!state.message?.trim()) {
        alert('❌ Please write your message before adding to cart.');
        return;
      }
    }

    // Validate paper selection
    if (!state.paperId) {
      alert('❌ Please select a paper type before adding to cart.');
      return;
    }

    // Validate delivery address - CRITICAL
    if (!state.recipientAddressId) {
      alert('❌ DELIVERY ADDRESS REQUIRED\n\nPlease select or add a recipient delivery address in Section 5 (Recipient Details) before adding to cart.\n\nYou cannot proceed to checkout without a delivery address.');
      // Scroll to recipient details section
      const recipientSection = document.querySelector('section:last-of-type');
      if (recipientSection) {
        recipientSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Prepare content for cart
    let finalMessage = state.message;
    if (isBundle) {
      finalMessage = bundleData.letters.map((l: any, i: number) => `[Letter ${i + 1}]\n${l.content}`).join("\n\n-------------------\n\n");
    }

    // Check if we're editing an existing order
    const isEditMode = searchParams.get("edit") === "true";

    if (isEditMode) {
      // Update existing cart item
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const editingOrderId = searchParams.get("orderId");

      // Find and update the item, or add as new if not found
      const itemIndex = cart.findIndex((item: any) => item.id === editingOrderId);

      const updatedItem = {
        id: editingOrderId || `custom_${Date.now()}`,
        type: "letter",
        name: selectedCollection ? selectedCollection.name : "Custom Handwritten Letter",
        price: displayTotal,
        quantity: 1,
        details: {
          ...state,
          message: finalMessage,
          breakdown,
          occasion: occasion || (selectedCollection ? selectedCollection.name : ""),
          inkColor,
          isBundle,
          bundleData: isBundle ? bundleData : undefined
        },
      };

      if (itemIndex >= 0) {
        cart[itemIndex] = updatedItem;
      } else {
        cart.push(updatedItem);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      alert('✅ Order updated successfully!');
    } else {
      // All validations passed - add new item to cart
      addItem({
        id: `custom_${Date.now()}`,
        type: "letter",
        name: selectedCollection ? selectedCollection.name : "Custom Handwritten Letter",
        price: displayTotal,
        quantity: 1,
        details: {
          ...state,
          message: finalMessage,
          breakdown,
          occasion: occasion || (selectedCollection ? selectedCollection.name : ""),
          inkColor,
          isBundle,
          bundleData: isBundle ? bundleData : undefined
        },
      });
    }

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
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 font-display">
            {selectedCollection ? selectedCollection.name : "Craft Your Letter"}
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto">
            {selectedCollection ? selectedCollection.description : "Every detail matters. Let's create something beautiful together."}
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
                selectedAddressId={state.recipientAddressId}
                onSelectAddress={(addressId) => updateState({ recipientAddressId: addressId })}
                addonsEnabled={addonsEnabled}
                isBundle={isBundle}
                bundleData={bundleData}
                onUpdateBundle={(data) => {
                  setBundleData(data);
                  if (data.price !== undefined) setBundlePrice(data.price);
                }}
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
                      ₹{displayTotal}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full h-12 rounded-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] text-white font-bold text-lg"
              >
                {searchParams.get("edit") === "true" ? "Update Order" : "Add to Cart"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
