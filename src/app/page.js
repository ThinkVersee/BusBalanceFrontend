// app/page.jsx
import AboutAppSection from "@/components/home/AboutAppSection";
import Footer from "@/components/home/Footer";
import HeroSection from "@/components/home/HeroSection";
import Navbar from "@/components/home/Navbar";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";

export default function Home() {
  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section id="buss">
        <HeroSection />
      </section>

      {/* SERVICES / FEATURES */}
      <section id="services">
        <ProblemSection />
      </section>

      {/* ABOUT */}
      <section id="about">
        <AboutAppSection/>
      </section>

      {/* SUPPORT / SOLUTION */}
      <section id="support">
        <SolutionSection />
      </section>
           <section id="footer">
        <Footer />
      </section>
    </main>
  );
}