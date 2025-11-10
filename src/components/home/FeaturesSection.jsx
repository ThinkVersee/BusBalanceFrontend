// components/FeaturesSection.jsx
import FeatureCard from './ui/FeatureCard';
import { DollarSign, TrendingUp, BarChart3, FileText, Clock, Smartphone } from 'lucide-react';

const features = [
  { icon: DollarSign, color: 'text-green-600', title: 'Income Tracking', desc: 'Record daily ticket sales, contract payments, and all revenue streams in seconds.' },
  { icon: TrendingUp, color: 'text-red-600', title: 'Expense Management', desc: 'Track fuel, maintenance, salaries, permits, and all business expenses automatically.' },
  { icon: BarChart3, color: 'text-blue-600', title: 'Profit Analysis', desc: 'Instant profit calculations with daily, weekly, and monthly reports at your fingertips.' },
  { icon: FileText, color: 'text-purple-600', title: 'Smart Reports', desc: 'Generate detailed financial reports for tax filing, loans, and business planning.' },
  { icon: Clock, color: 'text-orange-600', title: 'Real-Time Updates', desc: 'See your current financial status updated instantly as you add new entries.' },
  { icon: Smartphone, color: 'text-teal-600', title: 'Mobile Access', desc: 'Manage your business on the go from your phone, tablet, or computer.' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Bus Business
          </h2>
          <p className="text-xl text-gray-600">
            Powerful features designed specifically for bus owners
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} color={f.color} title={f.title} description={f.desc} />
          ))}
        </div>
      </div>
    </section>
  );
}