import { useState, useEffect } from 'react';
import Header from "./Header";
import { TypewriterEffect } from "./ui/typewriter-effect";
import { Button } from "./ui/button";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

export function Hero() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  const words = [
    { text: "Boost" },
    { text: "your" },
    { text: "academic" },
    { text: "productivity" },
    { text: "with" },
    { text: "AI.", className: "text-blue-500" },
  ];

  useEffect(() => {
    // Calculate the total duration of the typewriter effect
    const totalDuration = words.length * 0.4; // Assuming 0.4s per word
    const timer = setTimeout(() => {
      setShowButton(true);
    }, totalDuration * 1000); // Convert to milliseconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center h-[30rem] bg-black pt-20">
        <TypewriterEffect words={words} />
        <motion.div 
          className="pt-14 w-56"
          initial={{ opacity: 0 }}
          animate={{ opacity: showButton ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => router.push('/login')}
            className='bg-white text-lg text-black w-full p-6 rounded-full font-semibold hover:bg-slate-200'
          >
            Get started
          </Button>
        </motion.div>
      </div>
    </>
  );
}