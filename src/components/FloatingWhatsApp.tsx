"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingWhatsApp() {
    const phoneNumber = "919943376279"; // India WhatsApp number
    const message = encodeURIComponent("Hi, I want to send a handwritten letter.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center"
            >
                <span className="absolute right-full mr-4 bg-white text-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                    Chat with us
                </span>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-xl transition-all duration-300 hover:scale-110"
                >
                    <MessageCircle className="h-8 w-8 text-white fill-current" />
                </Button>
                {/* Pulse effect */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping -z-10"></span>
            </a>
        </div>
    );
}
