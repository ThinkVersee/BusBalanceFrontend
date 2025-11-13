export default function ProblemSection() {
  const features = [
    { 
      icon: "💼",
      title: "Business management", 
      desc: "With lots of unique blocks, you can easily build a page without coding. Build your next landing page." 
    },
    { 
      icon: "📊",
      title: "Business tracking", 
      desc: "With lots of unique blocks, you can easily build a page without coding. Build your next landing page." 
    },
    { 
      icon: "📱",
      title: "Beautiful mobile app", 
      desc: "With lots of unique blocks, you can easily build a page without coding. Build your next landing page." 
    }
  ];

  const stats = [
    { value: "1M+", label: "Customers visit Buss every months" },
    { value: "93%", label: "Satisfaction rate from our customers" },
    { value: "4.9", label: "Average customer ratings out of 5.00!" }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      {/* Top Feature Cards */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition text-center"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Getting started with Buss is easier than ever
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
              </p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition inline-flex items-center gap-2">
                Get started
                <span>→</span>
              </button>
            </div>

            {/* Right Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Samuel Spencer</div>
                    <div className="text-sm text-gray-500">Creative Director</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Daily Income</span>
                    <span className="text-sm font-semibold text-gray-900">03</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-sm font-semibold text-indigo-600">₹ 4.03</span>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-lg flex items-end p-2">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <polyline
                        points="0,35 20,30 40,25 60,20 80,15 100,10"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}