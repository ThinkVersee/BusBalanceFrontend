import { Twitter, Facebook, Instagram, Linkedin, Bus } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">

          {/* LOGO – your exact code */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              BUS BOOK
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex gap-6 text-gray-600">
            <a href="#" className="hover:text-gray-900">About</a>
            <a href="#" className="hover:text-gray-900">Pricing</a>
            <a href="#" className="hover:text-gray-900">Support</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-500 hover:text-blue-600 transition">
                <Icon size={18} />
              </a>
            ))}
          </div>

        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} BUS BOOK All rights reserved.
        </p>
      </div>
    </footer>
  );
}