"use client";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-xl md:text-6xl font-bold text-gray-900 leading-tight">
            Manage Your Bus<br />
            <span className="text-gray-900">Business Finances Effortlessly</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
          Smart financial tracking to keep your bus business organized, profitable, and stress-free.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-16 relative">
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 to-transparent rounded-t-2xl blur-2xl"></div>
            <div className="relative bg-white rounded-t-2xl shadow-2xl border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Home</span>
                    <span>Status / Website</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-600"></div>
                </div>
              </div>

              {/* Sessions */}
              <div className="bg-gray-50 rounded-xl p-2 sm:p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Sessions</h3>
                  <select className="text-sm border border-gray-300 rounded-lg px-2 py-1">
                    <option>Last 7 days</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  {/* Card 1 */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-blue-600"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Name</p>
                        <p className="font-semibold text-gray-900">Brandon Perez</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Score</span>
                        <span className="font-semibold">87</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time</span>
                        <span className="font-semibold">2 mins</span>
                      </div>
                      <div className="text-xs text-gray-500">Good work</div>
                      <div className="h-16 mt-3">
                        <svg viewBox="0 0 100 40" className="w-full h-full">
                          <polyline
                            points="0,35 20,28 40,32 60,20 80,25 100,15"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-purple-600"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Name</p>
                        <p className="font-semibold text-gray-900">Art Vandelayson</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Score</span>
                        <span className="font-semibold">97</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time</span>
                        <span className="font-semibold">5 mins</span>
                      </div>
                      <div className="text-xs text-gray-500">Good work</div>
                      <div className="h-16 mt-3">
                        <svg viewBox="0 0 100 40" className="w-full h-full">
                          <polyline
                            points="0,30 20,25 40,28 60,18 80,22 100,12"
                            fill="none"
                            stroke="#9333ea"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-green-600"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student Name</p>
                        <p className="font-semibold text-gray-900">Morgan West</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Score</span>
                        <span className="font-semibold">78</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time</span>
                        <span className="font-semibold">1 min</span>
                      </div>
                      <div className="text-xs text-gray-500">Good work</div>
                      <div className="h-16 mt-3">
                        <svg viewBox="0 0 100 40" className="w-full h-full">
                          <polyline
                            points="0,32 20,30 40,35 60,25 80,28 100,20"
                            fill="none"
                            stroke="#16a34a"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}