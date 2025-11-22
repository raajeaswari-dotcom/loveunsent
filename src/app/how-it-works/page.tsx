"use client";

import { getCloudinaryUrl } from "@/lib/cloudinaryClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenTool, Settings, Send, Heart } from "lucide-react";

export default function HowItWorks() {
    return (
        <div className="flex flex-col min-h-screen bg-taupe">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none bg-repeat"
                    style={{ backgroundImage: `url(${getCloudinaryUrl('/images/paper-texture.png')})` }}
                ></div>
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float-delayed pointer-events-none"></div>

                <div className="container px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-full shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-sm font-medium text-primary/80 tracking-wide uppercase">The Process</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Your Words, <span className="text-primary italic">Our Hands</span>
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        We've made it simple to send a piece of your heart. No stamps, no post office visits—just pure emotion, delivered.
                    </p>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-12 pb-32">
                <div className="container px-4">
                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10"></div>

                        <StepCard
                            icon={PenTool}
                            step="01"
                            title="Write"
                            description="Type your message or upload a photo of your handwriting. We can transcribe it for you."
                            delay={0}
                        />
                        <StepCard
                            icon={Settings}
                            step="02"
                            title="Customize"
                            description="Choose your paper, handwriting style, and add special touches like perfume or photos."
                            delay={100}
                        />
                        <StepCard
                            icon={Heart}
                            step="03"
                            title="We Create"
                            description="Our skilled artists handwrite your letter with care and attention to every detail."
                            delay={200}
                        />
                        <StepCard
                            icon={Send}
                            step="04"
                            title="Delivery"
                            description="Your letter is sealed in a premium envelope and shipped with tracking to your loved one."
                            delay={300}
                        />
                    </div>

                    <div className="mt-24 text-center">
                        <Link href="/customize">
                            <Button size="lg" className="h-16 px-12 rounded-full text-xl font-bold shadow-2xl hover:shadow-primary/20 hover:scale-105 transition-all duration-300">
                                Start Writing Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function StepCard({ icon: Icon, step, title, description, delay }: { icon: any, step: string, title: string, description: string, delay: number }) {
    return (
        <div
            className="bg-white p-8 rounded-2xl shadow-lg border border-primary/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors mx-auto md:mx-0">
                <Icon className="w-8 h-8 text-primary" />
            </div>
            <span className="absolute top-4 right-4 text-6xl font-serif font-bold text-muted/20 select-none group-hover:text-primary/5 transition-colors">
                {step}
            </span>
            <h3 className="text-2xl font-serif font-bold mb-3 text-center md:text-left">{title}</h3>
            <p className="text-muted-foreground leading-relaxed text-center md:text-left">
                {description}
            </p>
        </div>
    );
}
