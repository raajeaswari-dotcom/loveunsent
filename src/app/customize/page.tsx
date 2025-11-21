"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PaperSelector } from '@/components/PaperSelector';
import { PerfumeSelector } from '@/components/PerfumeSelector';
import { HandwritingCard } from '@/components/HandwritingCard';
import { AddonGrid } from '@/components/AddonGrid';
import { MessageEditor } from '@/components/MessageEditor';
import { mockApi } from '@/lib/mockApi';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useCustomization } from '@/context/CustomizationContext';
import { useCart } from '@/context/CartContext';
import { usePrice } from '@/hooks/usePrice';

const STEPS = ['Message', 'Paper', 'Handwriting', 'Perfume', 'Add-ons', 'Review'];

export default function CustomizePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);

    // Contexts
    const { state, updateState, canProceed } = useCustomization();
    const { addItem } = useCart();
    const { total, breakdown } = usePrice();

    // Data
    const [papers, setPapers] = useState<any[]>([]);
    const [perfumes, setPerfumes] = useState<any[]>([]);
    const [handwritings, setHandwritings] = useState<any[]>([]);
    const [addons, setAddons] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [p, pf, hw, ad] = await Promise.all([
                mockApi.getProducts(),
                mockApi.getPerfumes(),
                mockApi.getHandwritingStyles(),
                mockApi.getAddons()
            ]);
            setPapers(p);
            setPerfumes(pf);
            setHandwritings(hw);
            setAddons(ad);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleNext = () => {
        if (!canProceed(currentStep)) {
            alert("Please complete this step before proceeding.");
            return;
        }

        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Add to Cart
            addItem({
                id: `custom_${Date.now()}`,
                type: 'letter',
                name: 'Custom Handwritten Letter',
                price: total,
                quantity: 1,
                details: {
                    ...state,
                    breakdown
                }
            });
            router.push('/checkout');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const toggleAddon = (id: string) => {
        const currentAddons = state.addonIds;
        const newAddons = currentAddons.includes(id)
            ? currentAddons.filter(a => a !== id)
            : [...currentAddons, id];
        updateState({ addonIds: newAddons });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto" />
                    <p className="text-muted-foreground font-serif">Preparing your canvas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
            <div className="container max-w-6xl py-8 px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        Craft Your Letter
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Every detail matters. Let's create something beautiful together.
                    </p>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="mb-12 max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Background line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border"></div>

                        {/* Progress line */}
                        <div
                            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        ></div>

                        {/* Step circles */}
                        <div className="relative flex justify-between">
                            {STEPS.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center">
                                    <button
                                        onClick={() => idx <= currentStep && setCurrentStep(idx)}
                                        disabled={idx > currentStep}
                                        className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center text-sm font-semibold mb-2 ${idx < currentStep
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : idx === currentStep
                                                ? 'bg-background border-primary text-primary scale-110 shadow-lg shadow-primary/20'
                                                : 'bg-background border-border text-muted-foreground'
                                            } ${idx <= currentStep ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                                    >
                                        {idx < currentStep ? '✓' : idx + 1}
                                    </button>
                                    <span className={`text-xs md:text-sm font-medium transition-colors ${idx <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                                        }`}>
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6 md:p-8 border-2 shadow-xl bg-card/80 backdrop-blur-sm">
                            <div className="mb-6">
                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
                                    {STEPS[currentStep]}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {currentStep === 0 && "Pour your heart out in words"}
                                    {currentStep === 1 && "Choose the canvas for your thoughts"}
                                    {currentStep === 2 && "Select a writing style"}
                                    {currentStep === 3 && "Add a subtle fragrance (optional)"}
                                    {currentStep === 4 && "Make it extra special (optional)"}
                                    {currentStep === 5 && "Review your masterpiece"}
                                </p>
                            </div>

                            <div className="min-h-[300px]">
                                {currentStep === 0 && (
                                    <MessageEditor value={state.message} onChange={(val) => updateState({ message: val })} />
                                )}

                                {currentStep === 1 && (
                                    <PaperSelector papers={papers} selectedId={state.paperId || ''} onSelect={(id) => updateState({ paperId: id })} />
                                )}

                                {currentStep === 2 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {handwritings.map(hw => (
                                            <HandwritingCard
                                                key={hw.id}
                                                style={hw}
                                                isSelected={state.handwritingId === hw.id}
                                                onSelect={() => updateState({ handwritingId: hw.id })}
                                            />
                                        ))}
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-4">
                                        <Button
                                            variant={!state.perfumeId ? 'default' : 'outline'}
                                            onClick={() => updateState({ perfumeId: null })}
                                            className="w-full md:w-auto"
                                        >
                                            No Perfume
                                        </Button>
                                        <PerfumeSelector perfumes={perfumes} selectedId={state.perfumeId || ''} onSelect={(id) => updateState({ perfumeId: id })} />
                                    </div>
                                )}

                                {currentStep === 4 && (
                                    <AddonGrid addons={addons} selectedIds={state.addonIds} onToggle={toggleAddon} />
                                )}

                                {currentStep === 5 && (
                                    <ReviewSection
                                        message={state.message}
                                        paper={papers.find(p => p.id === state.paperId)}
                                        handwriting={handwritings.find(h => h.id === state.handwritingId)}
                                        perfume={perfumes.find(p => p.id === state.perfumeId)}
                                        addons={addons.filter(a => state.addonIds.includes(a.id))}
                                        deliveryDate={state.deliveryDate}
                                        onDateChange={(date: string) => updateState({ deliveryDate: date })}
                                    />
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sticky Sidebar Summary */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-24 border-2 shadow-xl bg-gradient-to-br from-card to-muted/20">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span>Your Letter</span>
                            </h3>

                            <div className="space-y-3 text-sm mb-6">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Paper</span>
                                    <span className="font-medium">{papers.find(p => p.id === state.paperId)?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Style</span>
                                    <span className="font-medium">{handwritings.find(h => h.id === state.handwritingId)?.name || '-'}</span>
                                </div>
                                {state.perfumeId && (
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Perfume</span>
                                        <span className="font-medium">{perfumes.find(p => p.id === state.perfumeId)?.name}</span>
                                    </div>
                                )}
                                {state.addonIds.length > 0 && (
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Add-ons</span>
                                        <span className="font-medium">{state.addonIds.length} selected</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-primary/5 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total</span>
                                    <span className="text-2xl font-bold text-primary">₹{total}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    className="flex-[2]"
                                    onClick={handleNext}
                                    size="lg"
                                >
                                    {currentStep === STEPS.length - 1 ? 'Add to Cart' : 'Continue'}
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ReviewSection({ message, paper, handwriting, perfume, addons, deliveryDate, onDateChange }: any) {
    // Calculate min date (Today + 5 days)
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 5);
    const minDateStr = minDate.toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-muted/20 border-dashed border-2">
                <h3 className="font-bold mb-3 text-lg">Your Message</h3>
                <p className="whitespace-pre-wrap font-serif text-lg italic leading-relaxed text-foreground/90">
                    {message || "No message entered..."}
                </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-accent/10 rounded-lg p-4 space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Paper</span>
                    <p className="font-semibold text-foreground">{paper?.name}</p>
                    <p className="text-sm text-muted-foreground">{paper?.description}</p>
                </div>
                <div className="bg-accent/10 rounded-lg p-4 space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Handwriting</span>
                    <p className="font-semibold text-foreground">{handwriting?.name}</p>
                </div>
                {perfume && (
                    <div className="bg-accent/10 rounded-lg p-4 space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Perfume</span>
                        <p className="font-semibold text-foreground">{perfume.name}</p>
                    </div>
                )}
                {addons.length > 0 && (
                    <div className="bg-accent/10 rounded-lg p-4 space-y-1">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider block">Add-ons</span>
                        <p className="font-semibold text-foreground">{addons.map((a: any) => a.name).join(', ')}</p>
                    </div>
                )}
            </div>


            <Card className="p-6 bg-white border-2 border-primary/10">
                <h3 className="font-bold mb-4 text-lg flex items-center gap-2">
                    <span>📅</span> Preferred Delivery Date
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">
                            We need at least 5 days to handwrite and ship your letter.
                        </p>
                        <input
                            type="date"
                            min={minDateStr}
                            value={deliveryDate || ''}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <div className="text-sm bg-primary/5 p-4 rounded-lg text-primary/80">
                        {deliveryDate ? (
                            <p>Target Delivery: <strong>{new Date(deliveryDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
                        ) : (
                            <p>Please select a date to help us prioritize your order.</p>
                        )}
                    </div>
                </div>
            </Card>
        </div >
    );
}
