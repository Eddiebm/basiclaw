"use client";

import { Navigation } from "@/components/sections/Navigation";
import { Hero } from "@/components/sections/Hero";
import { WhatIsBasicLaw } from "@/components/sections/WhatIsBasicLaw";
import { CountrySelector } from "@/components/sections/CountrySelector";
import { ExampleQuestions } from "@/components/sections/ExampleQuestions";
import { LawSchool } from "@/components/sections/LawSchool";
import { HomeFAQ } from "@/components/sections/HomeFAQ";
import { TrustDisclaimer } from "@/components/sections/TrustDisclaimer";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <WhatIsBasicLaw />
      <CountrySelector />
      <ExampleQuestions />
      <LawSchool />
      <HomeFAQ />
      <TrustDisclaimer />
      <Footer />
    </main>
  );
}
