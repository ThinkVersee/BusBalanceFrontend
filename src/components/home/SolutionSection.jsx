import Image from "next/image";

export default function SolutionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <Image
            src="/asstes/home/calender.jpeg"
            alt="Bus business dashboard preview"
            width={600}
            height={400}
            className="rounded-2xl shadow-lg"
            priority
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Manage your Business fast</h2>
          <p className="text-gray-600 mb-8">
            Track your bus income and expenses daily with ease — perfect for Indian bus owners managing tickets, fuel, drivers, and routes.
          </p>

          <div className="space-y-6">
            {[
              "With lots of unique blocks, you can easily build a page without coding.",
              "Track income and expenses with visual clarity and speed.",
              "Get real-time insights for smarter business management."
            ].map((text, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 font-bold rounded-full">
                  {index + 1}
                </div>
                <p className="text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}