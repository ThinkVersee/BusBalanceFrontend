// components/CTASection.jsx
export default function CTASection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Take Control of Your Bus Business?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join hundreds of bus owners who are already managing their finances better
        </p>
        <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg">
          Get Started for Free
        </button>
      </div>
    </section>
  );
}