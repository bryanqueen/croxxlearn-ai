import Link from "next/link";
import Image from "next/image";

export const FeatureCard = ({name, desc, path, img }) => {
    return (
        <div className="group relative block">
        <div className="relative h-[350px] sm:h-[450px]">
          <Image
            src={img}
            height={400}
            width={300}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-100 "
          />

        </div>
      
        <div className="absolute inset-0 flex flex-col items-start justify-end p-6">
          <h3 className="text-2xl font-medium text-white">{name}</h3>
      
          <p className="mt-1.5 text-pretty text-md text-white">
            {desc}
          </p>
      
          <Link
            href={path}
            className="mt-3 inline-block bg-black px-5 py-3 text-xs font-medium rounded-full tracking-wide text-white"
          >
            Try {name}
          </Link>
        </div>
      </div>
    )
}