// components/ui/FeatureCard.jsx
export default function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl transition">
      <Icon className={`w-12 h-12 ${color} mb-4`} />
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}