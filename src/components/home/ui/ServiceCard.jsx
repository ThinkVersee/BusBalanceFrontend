// components/ui/ServiceCard.jsx
export default function ServiceCard({ icon: Icon, title, description, bgColor, iconColor }) {
  return (
    <div className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-xl transition">
      <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}