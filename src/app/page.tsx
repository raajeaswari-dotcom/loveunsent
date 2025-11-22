"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { getCloudinaryUrl } from "@/lib/cloudinaryClient";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-mocha">
        <div className="container px-4 py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-left-8 duration-1000">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.9] text-[#F3E9DD] uppercase drop-shadow-sm">
                WRITE <br />
                HEARTFELT <br />
                LETTERS
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link href="/customize">
                  <Button size="lg" className="h-14 px-10 rounded-full text-lg font-bold bg-burgundy text-white hover:bg-burgundy/90 shadow-xl transition-all duration-300 hover:-translate-y-1">
                    SHOP ALL LETTERS
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Visuals */}
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
              <div className="relative z-10">
                <div className="relative overflow-hidden shadow-2xl rounded-3xl border-4 border-white/20">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster={getCloudinaryUrl("/images/hero-letter.png")}
                  >
                    <source src="https://cdn.coverr.co/videos/coverr-writing-a-letter-with-a-fountain-pen-5364/1080p.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sliding Categories Section */}
      <CategoriesCarousel />

      {/* Testimonials Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/30 -skew-y-3 transform origin-top-left scale-110"></div>
        <div className="container px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mt-3 mb-6">Heart to Heart Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Real stories from people who chose to express themselves authentically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="I sent a letter to my mom on her birthday. She said it's the first time in 30 years someone wrote to her by hand. She cried. Thank you for making this possible."
              author="Priya Sharma"
              location="Delhi"
              delay={0}
            />
            <TestimonialCard
              quote="In a long distance relationship. When she received this letter, she said it felt like I was there with her. The perfume and wax seal made it so special."
              author="Arjun Patel"
              location="Bangalore"
              delay={100}
            />
            <TestimonialCard
              quote="Surprised Papa on his retirement with a handwritten letter of all our childhood memories. He said it's his most precious gift. I was in tears."
              author="Sneha Reddy"
              location="Hyderabad"
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay bg-repeat"
          style={{ backgroundImage: `url(${getCloudinaryUrl('/images/paper-texture.png')})` }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>

        <div className="container px-4 relative z-10">
          <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 tracking-tight">Have Something to Say?</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto font-light leading-relaxed">
            Some feelings stay unsaid forever. Today, let your heart speak. <br />
            Just 5 minutes to create a memory that lasts a lifetime.
          </p>
          <Link href="/customize">
            <Button variant="secondary" size="lg" className="h-16 px-12 rounded-full text-xl font-bold shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300">
              Start Customizing
            </Button>
          </Link>
        </div>
      </section>

      <FloatingWhatsApp />
    </div>
  );
}

function CategoriesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const categories = [
    { icon: "💌", title: "Love Letters", description: "Pour your heart out", image: getCloudinaryUrl("/images/occasions/love_letters.png") },
    { icon: "🎉", title: "Birthday Wishes", description: "Make their day unforgettable", image: getCloudinaryUrl("/images/occasions/birthday_wishes.png") },
    { icon: "🙏", title: "Thank You Notes", description: "Gratitude expressed beautifully", image: getCloudinaryUrl("/images/occasions/thank_you.png") },
    { icon: "💔", title: "Apologies", description: "Heal hearts with sincere words", image: getCloudinaryUrl("/images/occasions/apologies.png") },
    { icon: "🎓", title: "Congratulations", description: "Celebrate their achievements", image: getCloudinaryUrl("/images/occasions/congratulations.png") },
    { icon: "👋", title: "Farewells", description: "Say goodbye with warmth", image: getCloudinaryUrl("/images/occasions/farewells.png") },
    { icon: "💍", title: "Wedding Vows", description: "Promise forever in writing", image: getCloudinaryUrl("/images/occasions/wedding_vows.png") },
    { icon: "👪", title: "Family Letters", description: "Keep bonds strong across miles" },
    { icon: "🪔", title: "Diwali Wishes", description: "Spread light and joy this festival" },
    { icon: "🧵", title: "Raksha Bandhan", description: "Celebrate the bond of siblings" },
    { icon: "🤝", title: "Friendship Day", description: "Honor those who stand by you" },
    { icon: "✨", title: "New Year Wishes", description: "Start fresh with heartfelt hopes" },
    { icon: "💭", title: "Missing You", description: "Bridge the distance with words" },
    { icon: "🌸", title: "Get Well Soon", description: "Send healing wishes and comfort" },
    { icon: "🎊", title: "Retirement", description: "Honor a lifetime of dedication" },
    { icon: "👶", title: "New Baby", description: "Welcome the newest blessing" },
    { icon: "💝", title: "Anniversary", description: "Celebrate your journey together" },
    { icon: "💪", title: "Motivational Letters", description: "Inspire and encourage someone" },
  ];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">Occasions</span>
            <h2 className="text-4xl font-serif font-bold mt-3 mb-4">Every Emotion, Beautifully Written</h2>
            <p className="text-muted-foreground text-lg">
              From love letters to apologies, celebrations to farewells—express it all with a handwritten touch.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="bg-white border border-primary/20 rounded-full p-4 hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-md"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="bg-white border border-primary/20 rounded-full p-4 hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-md"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-12 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat, index) => (
            <CategoryCard
              key={index}
              icon={cat.icon}
              title={cat.title}
              description={cat.description}
              image={cat.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ icon, title, description, image }: { icon: string, title: string, description: string, image?: string }) {
  return (
    <div className="min-w-[300px] group cursor-pointer">
      <div className="relative h-[400px] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-all duration-500">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-8xl text-primary/20 group-hover:text-primary/40 transition-colors">
            {icon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

        <div className="absolute bottom-0 left-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl mb-3 text-white border border-white/30">
            {icon}
          </div>
          <h3 className="text-2xl font-serif font-bold text-white mb-1">{title}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ quote, author, location, delay }: { quote: string, author: string, location: string, delay: number }) {
  return (
    <div
      className="bg-white p-8 rounded-2xl shadow-lg border border-primary/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col gap-6 relative group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Quote className="w-10 h-10 text-primary/20 group-hover:text-primary/40 transition-colors" />
      <p className="text-lg text-foreground/80 italic leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center gap-4 pt-4 border-t border-primary/5">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-serif">
          {author[0]}
        </div>
        <div>
          <p className="font-bold text-foreground">{author}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{location}</p>
        </div>
      </div>
    </div>
  );
}
