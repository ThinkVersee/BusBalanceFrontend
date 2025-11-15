// components/Navbar.jsx
"use client";

import { useState } from "react";
import { Menu, X, Bus } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("buss");

  const handleNav = (section) => {
    setActive(section);
    const element = document.getElementById(section);

    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    setMobileOpen(false);
  };

  const handleGetStarted = () => {
    window.location.href = "/login";
  };

  const navLinks = [
    { label: "BusBook", id: "buss" },
    { label: "Services", id: "services" },
    { label: "Support", id: "support" },
    { label: "About", id: "about" },
  ];

  return (
    <nav className="bg-white fixed w-full top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BUS BOOK</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-base font-normal relative transition-colors pb-1
                  ${active === link.id ? "text-gray-900" : "text-gray-600"}
                  hover:text-gray-900`}
              >
                {link.label}
                {active === link.id && (
                  <span className="absolute bottom-[-20px] left-0 right-0 h-[2px] bg-blue-600"></span>
                )}
              </button>
            ))}
          </div>

          {/* Get Started (Desktop) */}
          <div className="hidden md:block">
            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get started free
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden text-gray-800"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20">

          {/* Clean Close Button - Top Right */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-6 right-6 text-gray-800"
          >
            <X className="w-7 h-7" />
          </button>

          <div className="px-6 space-y-6 mt-6">

            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`block w-full text-left text-xl font-medium py-2
                  ${active === link.id ? "text-blue-600" : "text-gray-800"}
                  hover:text-blue-600`}
              >
                {link.label}
              </button>
            ))}

            {/* Get Started Button */}
            <button
              onClick={() => {
                handleGetStarted();
                setMobileOpen(false);
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors mt-4"
            >
              Get started free
            </button>

          </div>
        </div>
      )}
    </nav>
  );
}
