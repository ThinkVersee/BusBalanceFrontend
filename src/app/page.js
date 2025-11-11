// app/page.js
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import ServicesSection from "@/components/home/ServicesSection";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <ServicesSection />
      <CTASection />
      <Footer />
    </div>
  );
}