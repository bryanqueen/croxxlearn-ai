import Header from '../components/Header';
import Footer from '../components/Footer';
import { FeatureCard } from '@/components/FeatureCard';
import { Hero } from '@/components/Hero';
import { Inter } from "next/font/google";
import PdfGenerator from '../public/Pdf Generator.jpg';
import QuizGenerator from '../public/Quiz Generator.jpg';
import TaskHelper from '../public/Task Helper.jpg';

const inter = Inter({ subsets: ["latin"] });

const Features = [
  {
    name: 'Homework Helper',
    desc: 'Ask questions and get help with your homework tasks.',
    image: TaskHelper,
    path: '/'
  },
  {
    name: 'Quiz Generator',
    desc: 'Generate quizzes for practice on any topic you choose.',
    image: QuizGenerator,
    path: '/'
  },
  {
    name: 'PDF Generator',
    desc: 'Generate detailed PDF handbooks for better understanding.',
    image: PdfGenerator,
    path: '/'
  }
]

const Home = () => (
  <div className={`min-h-screen flex flex-col ${inter.className}`}>
    <Hero/>
    <main className="flex-grow bg-black p-4 pb-20 items-center w-full">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:px-6">
        {Features.map((feature, index) => (
          <FeatureCard key={index} name={feature.name} desc={feature.desc} path={feature.path} img={feature.image}/>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Home;

{/* <div className="bg-secondary text-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-4">Homework Helper</h2>
<p>Ask questions and get help with your homework tasks.</p>
</div>
<div className="bg-secondary text-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-4">Quiz Generator</h2>
<p>Generate quizzes for practice on any topic you choose.</p>
</div>
<div className="bg-secondary text-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-4">PDF Generator</h2>
<p>Generate detailed PDF handbooks for better understanding.</p>
</div> */}

