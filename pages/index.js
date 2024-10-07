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
    desc: 'Ask questions and get up to speed in any academic area.',
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
    desc: 'Upload your academic documents, get summarizations and chat with your document.',
    image: PdfGenerator,
    path: '/'
  }
];

const items = ['AI', 'WILL', 'REPLACE', 'YOUR', 'TUTORS', '✨'];

const Home = () => (
  <div className={`min-h-screen flex flex-col ${inter.className} bg-black`}>
    <Hero />
    <main className="flex-grow px-4 py-8">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-white text-center mb-12">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-6 px-2 md:px-6 lg:py-20">
          {Features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              name={feature.name} 
              desc={feature.desc} 
              path={feature.path} 
              img={feature.image}
            />
          ))}
        </div>
      </div>
    </main>
    <Marquee items={items} />
    <Footer />
  </div>
);

export default Home;