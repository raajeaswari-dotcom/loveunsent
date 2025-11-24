"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collections } from "@/data/collectionData";

export default function OurCollectionPage() {
    return (
        <div className="min-h-screen bg-[#DBCDBE] py-20">
            <div className="container px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-nighty text-[#511317] mb-6">Our Collection</h1>
                    <p className="text-[#511317] text-lg max-w-2xl mx-auto">
                        Explore our curated collection of handwritten letters, each designed to convey your deepest emotions with elegance and care.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {collections.map((collection, index) => (
                        <div
                            key={index}
                            className="bg-transparent border-2 border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                        >
                            <div className="h-64 overflow-hidden relative">
                                <img
                                    src={collection.image}
                                    alt={collection.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h3 className="text-2xl font-bold mb-4 text-[#511317] font-gorditas">{collection.title}</h3>
                                <p className="text-[#511317] mb-8 flex-1 leading-relaxed">
                                    {collection.description}
                                </p>
                                <Link href="/customize" className="mt-auto">
                                    <Button
                                        className="w-full h-12 rounded-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] text-white font-extralight text-base"
                                    >
                                        CUSTOMIZE
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
