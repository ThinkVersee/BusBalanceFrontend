// components/home/AboutAppSection.jsx
import Image from "next/image";
import { Palette, MousePointer, Smile } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Creative Design",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Faucibus amet etiam tincidunt rhoncus.",
  },
  {
    icon: MousePointer,
    title: "Easy to Use",
    desc: "Clean and simple interface designed for everyone — from beginners to experts.",
  },
  {
    icon: Smile,
    title: "Best User Experience",
    desc: "Smooth, intuitive, and responsive — making every action faster and easier.",
  },
];

export default function AboutAppSection() {
  return (
    <section className="py-20 bg-[#F7F7FA]">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT: Image */}
        <div className="flex justify-center">
          <Image
            src="/asstes/home/about.jpg" // ✅ Image path from /public
            alt="BusBalance app preview"
            width={500}
            height={500}
            className="rounded-2xl shadow-lg object-contain"
            priority
          />
        </div>

        {/* RIGHT: Text + Features */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            About Our App
          </h2>
          <p className="text-gray-600 mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra nunc ante vel vitae.
            Est tellus vitae, nullam lobortis enim. Faucibus amet etiam tincidunt rhoncus.
          </p>

          <div className="space-y-6">
            {features.map((f, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
