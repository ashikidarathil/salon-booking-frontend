'use client';

import { Header } from '@/components/user/Header';
import { Footer } from '@/components/user/Footer';
import { HeroSection } from '@/components/user/HeroSection';
import { SearchBar } from '@/components/user/SearchBar';
import { PopularServices } from '@/components/user/PopularServices';
import { TopStylists } from '@/components/user/TopStylists';
import { TrendingHairstyles } from '@/components/user/TrendingHairstyles';
import { Testimonials } from '@/components/user/Testimonials';
import { SpecialOffers } from '@/components/user/SpecialOffers';
import { HowItWorks } from '@/components/user/HowItWorks';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <SearchBar />
        <PopularServices />
        <TopStylists />
        <TrendingHairstyles />
        <Testimonials />
        <SpecialOffers />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}
