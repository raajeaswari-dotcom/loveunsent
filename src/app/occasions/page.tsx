"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCloudinaryUrl } from "@/lib/cloudinaryClient";

export default function OccasionsPage() {
    const occasions = [
        {
            title: "CLASSIC",
            description: "A personal handwritten letter designed just for its envelope, which has a pre-fixed design.",
            image: getCloudinaryUrl("/images/occasions/love_letters.png"),
            link: "/customize?type=classic"
        },
        {
            title: "OPEN WHEN",
            description: "A bundle of 'Open When' letters tied with a card, ribbon, ready for sending.",
            image: getCloudinaryUrl("/images/occasions/birthday_wishes.png"),
            link: "/customize?type=open-when"
        },
        {
            title: "UNSENT",
            description: "A person writing a heartfelt 'Unsent Letter' as a diary, with an envelope nearby.",
            image: getCloudinaryUrl("/images/occasions/thank_you.png"),
            link: "/customize?type=unsent"
        },
        {
            title: "Love Letters",
            description: "Pour your heart out with romantic handwritten letters.",
            image: getCloudinaryUrl("/images/occasions/love_letters.png"),
            link: "/customize?occasion=love"
        },
        {
            title: "Birthday Wishes",
            description: "Make their day unforgettable with a heartfelt birthday letter.",
            image: getCloudinaryUrl("/images/occasions/birthday_wishes.png"),
            link: "/customize?occasion=birthday"
        },
        {
            title: "Thank You Notes",
            description: "Express gratitude beautifully with handwritten thanks.",
            image: getCloudinaryUrl("/images/occasions/thank_you.png"),
            link: "/customize?occasion=thankyou"
        },
        {
            title: "Apologies",
            description: "Heal hearts with sincere words of apology.",
            image: getCloudinaryUrl("/images/occasions/apologies.png"),
            link: "/customize?occasion=apology"
        },
        {
            title: "Congratulations",
            description: "Celebrate their achievements with a special letter.",
            image: getCloudinaryUrl("/images/occasions/congratulations.png"),
            link: "/customize?occasion=congrats"
        },
        {
            title: "Farewells",
            description: "Say goodbye with warmth and heartfelt words.",
            image: getCloudinaryUrl("/images/occasions/farewells.png"),
            link: "/customize?occasion=farewell"
        },
        {
            title: "Wedding Vows",
            description: "Promise forever in writing with beautiful vows.",
            image: getCloudinaryUrl("/images/occasions/wedding_vows.png"),
            link: "/customize?occasion=wedding"
        },
    ];

    return (
        <div className="min-h-screen bg-[#F5EFE7]">
            {/* Hero Section */}
            <section className="bg-[#C4A68A] py-20">
                <div className="container px-4 max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">Shop All Letters</h1>
                    <p className="text-lg text-white/90 leading-relaxed max-w-3xl mx-auto">
                        Choose from our collection of heartfelt letter types for every occasion.
                        Each letter is handwritten with care and delivered with love.
                    </p>
                </div>
            </section>

            {/* Occasions Grid */}
            <section className="py-16">
                <div className="container px-4 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {occasions.map((occasion, index) => (
                            <Link key={index} href={occasion.link}>
                                <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={occasion.image}
                                            alt={occasion.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-6">
                                            <h3 className="text-2xl font-bold text-white mb-2">{occasion.title}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-700 mb-4">{occasion.description}</p>
                                        <Button className="w-full h-12 rounded-full bg-[#5C2E2E] hover:bg-[#4A2424] text-white font-bold">
                                            Customize Now
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
