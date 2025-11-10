// components/ServicesSection.jsx
import ServiceCard from './ui/ServiceCard';
import { Bus, Shield, FileText, BarChart3 } from 'lucide-react';

const services = [
  { icon: Bus, bg: 'bg-blue-100', color: 'text-blue-600', title: 'Multiple Bus Management', desc: 'Track unlimited buses in one account' },
  { icon: Shield, bg: 'bg-green-100', color: 'text-green-600', title: 'Secure Data Storage', desc: 'Your financial data is safe and encrypted' },
  { icon: FileText, bg: 'bg-purple-100', color: 'text-purple-600', title: 'Tax-Ready Reports', desc: 'Generate reports for easy tax filing' },
  { icon: BarChart3, bg: 'bg-orange-100', color: 'text-orange-600', title: 'Business Insights', desc: 'Get actionable insights to grow profits' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600">Complete support for your bus business management</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <ServiceCard key={i} icon={s.icon} bgColor={s.bg} iconColor={s.color} title={s.title} description={s.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}