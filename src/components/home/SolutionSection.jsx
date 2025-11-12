// components/home/SolutionSection.jsx
export default function SolutionSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Your Simple Solution in One App
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          BusBook automatically tracks all your income and expenses, calculates profits instantly, and shows you exactly how your business is performing.
        </p>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">2 min</div>
              <div className="text-gray-700">Daily Entry Time</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-700">Accurate Tracking</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-700">Access Anywhere</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}