import Link from "next/link";
import Image from "next/image";

export const FeatureCard = ({ name, desc, path, img }) => {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105">
      <div className="relative h-48">
        <Image
          src={img}
          layout="fill"
          objectFit="cover"
          alt={name}
          className="transition-all duration-300 hover:opacity-75"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
        <p className="text-gray-300 mb-4">{desc}</p>
        <Link
          href={path}
          className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-full transition-all duration-300 hover:bg-blue-700"
        >
          Try now
        </Link>
      </div>
    </div>
  );
};