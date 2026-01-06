// src/components/HowItWorks.tsx
'use client';

export function HowItWorks() {
  return (
    <section className="container px-4 py-16 mx-auto md:py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-semibold tracking-tight font-heading md:text-4xl">
          How It Works
        </h2>
        <p className="text-muted-foreground">Book your appointment in 3 easy steps</p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-primary/10">
            <span className="text-2xl font-bold text-primary">1</span>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Choose Your Service</h3>
          <p className="text-muted-foreground">
            Browse our services and select the one that suits your needs best.
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-primary/10">
            <span className="text-2xl font-bold text-primary">2</span>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Pick Your Stylist</h3>
          <p className="text-muted-foreground">
            Choose from our talented team of professional stylists and specialists.
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-primary/10">
            <span className="text-2xl font-bold text-primary">3</span>
          </div>
          <h3 className="mb-2 text-xl font-semibold">Book & Enjoy</h3>
          <p className="text-muted-foreground">
            Select your preferred time and date, then enjoy your premium salon experience.
          </p>
        </div>
      </div>
    </section>
  );
}
