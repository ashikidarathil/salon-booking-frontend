'use client';

import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-[#2C3E50] text-white">
      <div className="container px-4 py-16 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="solar:scissors-bold" className="size-6 text-[#FF6B6B]" />
              <span className="text-xl font-bold font-heading">SalonBook</span>
            </div>
            <p className="mb-4 text-sm text-gray-300">
              Your trusted partner for professional salon services and exceptional beauty
              experiences.
            </p>
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" className="text-white size-8 hover:bg-white/10">
                <Icon icon="solar:phone-bold" className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white size-8 hover:bg-white/10">
                <Icon icon="solar:letter-bold" className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white size-8 hover:bg-white/10">
                <Icon icon="solar:map-point-bold" className="size-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Hair Cut
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Coloring
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Treatment
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Styling
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Spa
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Our Team
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FF6B6B] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Icon icon="solar:phone-bold" className="size-4 text-[#FF6B6B]" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="solar:letter-bold" className="size-4 text-[#FF6B6B]" />
                <span>hello@salonbook.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon icon="solar:map-point-bold" className="size-4 text-[#FF6B6B]" />
                <span>123 Beauty Street, NY</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-400 md:flex-row">
          <p>© 2024 SalonBook. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#FF6B6B] transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
