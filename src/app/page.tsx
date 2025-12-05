"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, PenTool, Heart, Send } from "lucide-react";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getCloudinaryUrl } from "@/lib/cloudinaryClient";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5EFE7]">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#A37B65]">
        <div className="container px-4 py-8 relative z-10">
          <div className="grid lg:grid-cols-[40%_60%] gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-20">
              <h1 className="text-3xl lg:text-5xl font-bold font-gorditas tracking-wider leading-tight text-[rgb(243,233,221)]">
                WRITE<br />
                HEARTFELT<br />
                LETTERS
              </h1>

              <Link href="/our-collection">
                <Button
                  size="sm"
                  className="h-8 px-4 rounded-full text-xs font-extralight bg-[rgb(81,19,23)] text-white hover:bg-[#4A2424] shadow-lg transition-all duration-300"
                >
                  SHOP ALL LETTERS
                </Button>
              </Link>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-[#F5EFE7] p-8 h-[400px] flex items-center justify-center">
                <img
                  src={getCloudinaryUrl("/images/hero-letter.png")}
                  alt="Handwritten Letters"
                  className="w-full h-full object-contain transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider Section */}
      <section className="h-[50px] bg-[#511317]"></section>

      {/* Our Collection Section */}
      <OurCollection />

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#DBCDBE]">
        <div className="container px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#511317]">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[rgb(81,19,23)] flex items-center justify-center mx-auto mb-6">
                <PenTool className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#511317]">You write your words</h3>
              <p className="text-[#511317] text-sm">Write a letter for the person</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[rgb(81,19,23)] flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#511317]">We craft with love</h3>
              <p className="text-[#511317] text-sm">Each letter is handwritten with care</p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 rounded-full bg-[rgb(81,19,23)] flex items-center justify-center mx-auto mb-6">
                <Send className="w-12 h-12 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-[#511317]">Delivered to the person</h3>
              <p className="text-[#511317] text-sm">We deliver to the receiver</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-[#D79A79]">
        <div className="container px-4 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#2C1B13]">Newsletter Signup</h2>
          <p className="text-[#2C1B13]/90 mb-8">
            Subscribe today! Get the latest news and stay updated about our new products and special offers.
          </p>

          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your email..."
              className="h-12 rounded-full bg-white/90 border-none"
            />
            <Button
              className="h-12 px-8 rounded-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] text-white font-extralight"
            >
              Enter
            </Button>
          </div>
        </div>
      </section>

      <FloatingWhatsApp />
    </div>
  );
}

function OurCollection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');

        if (!response.ok) {
          console.error('Failed to fetch collections, status:', response.status);
          setLoading(false);
          return;
        }

        const result = await response.json();
        if (result.success && result.data) {
          const collectionData = result.data.collections || [];
          setCollections(collectionData);
        } else {
          setCollections([]);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const scrollTo = direction === "left"
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (!isPaused) {
      intervalId = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          // If we reached the end, scroll back to start
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            scroll("right");
          }
        }
      }, 3000); // Scroll every 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPaused]);



  return (
    <section className="pt-10 pb-20 bg-transparent">
      <div className="container px-4">
        <h2 className="text-4xl font-display font-black text-center mb-16 text-[#2C1B13]">Our Collection</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#511317]"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-xl text-[#511317] mb-4">No collections available at the moment.</p>
              <p className="text-sm text-[#511317]/70">Please check back later or contact support.</p>
            </div>
          </div>
        ) : (
          <div
            className="relative max-w-6xl mx-auto"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Navigation Arrows */}
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Cards Container */}
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {collections.map((collection, index) => (
                <div
                  key={collection._id || index}
                  className="min-w-[350px] bg-transparent border-2 border-[#2C1B13]/10 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={collection.imageUrl}
                      alt={collection.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-black mb-3 text-[#2C1B13] font-display uppercase">{collection.name}</h3>
                    <p className="text-[#2C1B13] text-sm mb-6 flex-1 leading-relaxed">
                      {collection.description}
                    </p>
                    <Link href={`/customize?type=${collection.slug}`} className="mt-auto">
                      <Button
                        className="w-full h-10 rounded-full bg-[rgb(81,19,23)] hover:bg-[#4A2424] text-white font-extralight text-sm"
                      >
                        CUSTOMIZE
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
