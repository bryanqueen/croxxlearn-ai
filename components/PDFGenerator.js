import Link from 'next/link';

const Header = () => (
  <header className="bg-primary text-white p-4">
    <nav className="container mx-auto flex justify-between items-center">
      <div className="text-lg font-bold">AI Learning Assistant</div>
      <div>
        <Link href="/"><a className="mx-2">Home</a></Link>
        <Link href="/chatbot"><a className="mx-2">Chatbot</a></Link>
        <Link href="/quiz-generator"><a className="mx-2">Quiz Generator</a></Link>
        <Link href="/pdf-generator"><a className="mx-2">PDF Generator</a></Link>
        <Link href="/login"><a className="mx-2">Login</a></Link>
      </div>
    </nav>
  </header>
);

export default Header;
