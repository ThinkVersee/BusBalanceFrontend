import { Briefcase, BarChart3, Smartphone, Users, TrendingUp, IndianRupee, Star } from "lucide-react";

export default function ProblemSection() {
  const features = [
    {
      icon: Briefcase,
      title: "Business Management",
      desc: "Manage your bus fleet, drivers, routes, and schedules effortlessly — all from one dashboard, no coding required.",
    },
    {
      icon: BarChart3,
      title: "Daily Profit Tracking",
      desc: "Auto-calculate earnings from ticket sales and deduct fuel, driver wages, and maintenance costs in real time.",
    },
    {
      icon: Smartphone,
      title: "Mobile App for Owners",
      desc: "Log trips, fuel fills, and passenger counts on the go. View profit per trip instantly from your phone.",
    },
  ];

  const stats = [
    { value: "1M+", label: "Bus Owners Use Monthly", icon: Users, gradient: "from-blue-500 to-cyan-500" },
    { value: "93%", label: "Profit Accuracy", icon: TrendingUp, gradient: "from-emerald-500 to-teal-500" },
    { value: "₹50L+", label: "Daily Income Tracked", icon: IndianRupee, gradient: "from-orange-500 to-red-500" },
    { value: "4.9", label: "Rating from Owners", icon: Star, gradient: "from-yellow-400 to-amber-500" },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-indigo-100 rotate-45 opacity-30 animate-float-delay"></div>
        <div className="absolute bottom-32 left-1/3 w-20 h-20 bg-purple-100 rounded-lg opacity-25 animate-float-slow"></div>
        <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-indigo-200 rounded-full opacity-15 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-200 rotate-12 opacity-20 animate-float-delay"></div>
      </div>

      {/* Feature Cards */}
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30"></div>

          <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Start Tracking Profit in <span className="text-indigo-600">60 Seconds</span>
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Track daily income from tickets, deduct fuel & driver costs, and see real-time profit per trip or route. Designed for Indian bus owners — no spreadsheets, no hassle.
              </p>
            </div>

            {/* Samuel Spencer Card – Compact & Realistic */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs mx-auto border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex-shrink-0"></div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Rajesh Kumar</div>
                    <div className="text-xs text-gray-500">Bus Owner, Pune</div>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today’s Trips</span>
                    <span className="font-semibold text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Profit</span>
                    <span className="font-semibold text-indigo-600">₹4,031</span>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg flex items-end p-2 overflow-hidden">
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <polyline
                        points="0,35 20,30 40,25 60,20 80,15 100,10"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2.5"
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

        {/* Stats with Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center group">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${stat.gradient} text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                {/* <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-900 mb-1">
                  {stat.value}
                </div> */}
                <div className="text-sm text-gray-600 max-w-xs mx-auto">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}