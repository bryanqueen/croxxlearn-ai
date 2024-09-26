import Header from '../components/Header';
import Footer from '../components/Footer';
import { FeatureCard } from '@/components/FeatureCard';
import { Hero } from '@/components/Hero';
import { Inter } from "next/font/google";
import PdfGenerator from '../public/Pdf Generator.jpg';
import QuizGenerator from '../public/Quiz Generator.jpg';
import TaskHelper from '../public/Task Helper.jpg';
import Marquee from '@/components/Marquee';

const inter = Inter({ subsets: ["latin"] });

const Features = [
  {
    name: 'Chatty',
    desc: 'Ask questions and get help with your homework tasks.',
    image: TaskHelper,
    path: '/chatbot'
  },
  {
    name: 'Quizzy',
    desc: 'Generate quizzes for practice on any topic you choose.',
    image: QuizGenerator,
    path: '/quiz'
  },
  {
    name: 'Docky',
    desc: 'Generate detailed PDF handbooks for better understanding.',
    image: PdfGenerator,
    path: '/'
  }
]
const items = ['AI', 'WILL', 'REPLACE', 'YOUR', 'TUTORS', '✨']

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
    <Marquee items={items}/>
    <Footer />
  </div>
);

export default Home;

