import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="container py-10 px-4 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-serif font-bold mb-6">About Love Unsent</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We believe that in a world of instant messages, a handwritten letter is a timeless treasure.
                </p>
            </div>

            <div className="space-y-16">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="relative h-[400px] bg-muted rounded-lg overflow-hidden">
                        {/* Placeholder */}
                        <div className="absolute inset-0 bg-[url('/placeholders/about-1.jpg')] bg-cover bg-center opacity-80" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-2xl font-serif font-bold">Our Story</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            It started with a simple observation: we've lost the art of letter writing. The anticipation of opening an envelope, the smell of paper, the personal touch of ink on page—these experiences were fading away.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Love Unsent was born to bridge the gap between digital convenience and analog charm. We connect skilled calligraphers and writers with people who want to send meaningful messages.
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center md:flex-row-reverse">
                    <div className="order-1 md:order-2 relative h-[400px] bg-muted rounded-lg overflow-hidden">
                        {/* Placeholder */}
                        <div className="absolute inset-0 bg-[url('/placeholders/about-2.jpg')] bg-cover bg-center opacity-80" />
                    </div>
                    <div className="order-2 md:order-1 space-y-4">
                        <h2 className="text-2xl font-serif font-bold">Our Craft</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Every letter is written by a real human hand. We don't use robots or plotting machines. Our community of writers takes pride in their penmanship, ensuring that every curve and stroke conveys the emotion behind your words.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            We source premium papers from sustainable mills and use high-quality inks that stand the test of time.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
