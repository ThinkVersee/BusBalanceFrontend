import { Briefcase, BarChart3, Smartphone } from "lucide-react";

export default function ProblemSection() {
  const features = [
    {
      icon: Briefcase,
      title: "Business Management",
      desc: "With lots of unique blocks, you can easily build a page without coding. Build your next landing page.",
    },
    {
      icon: BarChart3,
      title: "Business Tracking",
      desc: "With lots of unique blocks, you can easily build a page without coding. Build your next landing page.",
    },
    {
      icon: Smartphone,
      title: "Beautiful Mobile App",
      desc: "With lots of unique blocks, you can easily build a page without coding. Build your next landing page.",
    },
  ];

  const stats = [
    { value: "1M+", label: "Customers visit Buss every month" },
    { value: "93%", label: "Satisfaction rate from our customers" },
    { value: "4.9", label: "Average customer ratings out of 5.00!" },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Floating Geometric Background Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-100 rotate-45 opacity-30 animate-float-delay"></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-purple-100 rounded-lg opacity-25 animate-float-slow"></div>
        <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-indigo-200 rounded-full opacity-15 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-200 rotate-12 opacity-20 animate-float-delay"></div>
      </div>

      {/* Top Feature Cards */}
      <div className="max-w-6xl mx-auto mb-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white mb-5 group-hover:scale-110 transition-transform">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30"></div>

          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                Getting started with Buss is easier than ever
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
                Get Started
                <span>→</span>
              </button>
            </div>

            {/* Right Preview Card */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0"></div>
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
                  <div className="h-32 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg flex items-end p-3 overflow-hidden">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <polyline
                        points="0,35 20,30 40,25 60,20 80,15 100,10"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        className="drop-shadow-sm"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
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
            <div key={i} className="text-center group">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 max-w-xs mx-auto">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}