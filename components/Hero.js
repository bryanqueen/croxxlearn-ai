import Header from "./Header";
import { TypewriterEffect } from "./ui/typewriter-effect";

export function Hero() {
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
      className: "dark:text-blue-500",
    },
  ];
  return (
    <>
        <Header/>
    <div className="flex flex-col items-center justify-center h-[26rem] bg-black ">
      {/* <p className="text-neutral-600 dark:text-neutral-200 text-base  mb-10">
        The road to freedom starts from here
      </p> */}
      <TypewriterEffect words={words} />
      {/* <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
        
        <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
          Signup
        </button>
      </div> */}
    </div>
    </>
  );
}
