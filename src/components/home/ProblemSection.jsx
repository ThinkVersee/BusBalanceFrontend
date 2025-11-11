// components/ProblemSection.jsx
export default function ProblemSection() {
  const problems = [
    { title: "Lost Track of Money", desc: "Forgetting to record fuel expenses, maintenance costs, or daily income leads to confusion and lost profits." },
    { title: "Manual Calculations", desc: "Spending hours with pen and paper or spreadsheets trying to calculate daily profits and monthly expenses." },
    { title: "No Clear Picture", desc: "Unable to see which buses are profitable, where money is going, and how to improve business performance." }
  ];

  return (
    <section id="problem" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Are You Struggling With These Problems?
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Most bus owners face these daily challenges
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, i) => (
            <div key={i} className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">{p.title}</h3>
              <p className="text-gray-700">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}