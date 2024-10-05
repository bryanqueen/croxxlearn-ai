import Header from "./Header";
import { TypewriterEffect } from "./ui/typewriter-effect";
import { Button } from "./ui/button";
import { useRouter } from "next/router";

export function Hero() {
  const router = useRouter();
  const words = [
    {
      text: "Boost",
    },
    {
      text: "your",
    },
    {
        text: "academic"
    },
    {
      text: "productivity",
    },
    {
      text: "with",
    },
    {
      text: "AI.",
      className: "text-blue-500",
    },
  ];
  return (
    <>
        <Header/>
    <div className="flex flex-col items-center justify-center h-[30rem] bg-black pt-20 ">
      {/* <p className="text-neutral-600 dark:text-neutral-200 text-base  mb-10">
        The road to freedom starts from here
      </p> */}
      <TypewriterEffect words={words} />
      <div className="pt-14 w-56 ">
      <Button
        onClick={()=> router.push('/login')}
        className=' bg-white text-lg text-black w-full p-6 rounded-full font-semibold hover:bg-slate-200'
      >
        Get started
      </Button>
      </div>
    </div>
    </>
  );
}
