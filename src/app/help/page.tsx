import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

// Simple Accordion implementation if ShadCN one isn't fully set up
function SimpleAccordion({ items }: { items: { q: string, a: string }[] }) {
    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                    <details className="group">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                            <span>{item.q}</span>
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-muted-foreground mt-3 group-open:animate-fadeIn">
                            {item.a}
                        </p>
                    </details>
                </div>
            ))}
        </div>
    );
}

export default function HelpPage() {
    const faqs = [
        {
            q: "Is the handwriting really done by humans?",
            a: "Yes! 100%. We do not use robots or fonts. Every letter is handwritten by our community of skilled writers and calligraphers."
        },
        {
            q: "How long does delivery take?",
            a: "Typically, writing takes 1-2 days, and shipping takes 3-5 business days depending on your location. You can track your order status in real-time."
        },
        {
            q: "Can I see a preview of my letter?",
            a: "We provide a digital preview of the text layout, but since each letter is handwritten, the final result will have natural variations that make it unique."
        },
        {
            q: "Do you ship internationally?",
            a: "Yes, we ship to most countries. International shipping rates and times vary."
        },
        {
            q: "What if I'm not happy with the handwriting?",
            a: "We have a strict Quality Control process. If the letter doesn't meet our standards, we rewrite it. If you are unsatisfied upon delivery, please contact us."
        }
    ];

    return (
        <div className="container py-10 px-4 max-w-3xl">
            <h1 className="text-4xl font-serif font-bold mb-6 text-center">About Love Unsent</h1>
            <SimpleAccordion items={faqs} />
        </div>
    );
}
