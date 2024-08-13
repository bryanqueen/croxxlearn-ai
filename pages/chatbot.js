// import { useState } from 'react';
// import axios from 'axios';

// const Chatbot = () => {
//   const [question, setQuestion] = useState('');
//   const [response, setResponse] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setResponse('');
//     setLoading(true);

//     try {
//       const res = await axios.post('/api/chatbot', { question }, {
//         responseType: 'stream',
//       });

//       res.data.on('data', (chunk) => {
//         setResponse((prev) => prev + chunk.toString());
//       });

//       res.data.on('end', () => {
//         setLoading(false);
//       });
//     } catch (error) {
//       console.error('Error fetching response:', error);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-black text-white">
//       <header className="p-4 border-b border-gray-800">
//         <h1 className="text-2xl font-bold">croxxlearn ai.</h1>
//       </header>
//       <main className="flex-grow flex flex-col items-center justify-center p-4">
//         <div className="w-full max-w-md">
//           <h2 className="text-2xl font-bold mb-6">Boost your academic productivity with AI.</h2>
//           <form onSubmit={handleSubmit} className="mb-6">
//             <label className="block mb-2">Ask a Question</label>
//             <input
//               type="text"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               className="mb-4 p-3 border border-gray-700 rounded w-full bg-black text-white"
//               placeholder="Type your question here..."
//               required
//             />
//             <button 
//               type="submit" 
//               className="w-full p-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition duration-300"
//               disabled={loading}
//             >
//               {loading ? 'Processing...' : 'Get Answer'}
//             </button>
//           </form>
//           {response && (
//             <div className="mt-6 bg-black p-4 rounded border border-gray-700">
//               <h3 className="font-bold mb-2">Answer:</h3>
//               <p>{response}</p>
//             </div>
//           )}
//         </div>
//       </main>
//       <footer className="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
//         © 2024 Croxxlearn AI. All rights reserved.
//       </footer>
//     </div>
//   );
// };

// export default Chatbot;

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { type: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chatbot-2', { question: input }, {
        responseType: 'stream',
      });

      let aiResponse = '';
      res.data.on('data', (chunk) => {
        aiResponse += chunk.toString();
        setMessages(prevMessages => [
          ...prevMessages.slice(0, -1),
          { type: 'ai', content: aiResponse }
        ]);
      });

      res.data.on('end', () => {
        setLoading(false);
      });

      res.data.on('error', (err) => {
        setMessages(prevMessages => [
          ...prevMessages,
          { type: 'error', content: 'An error occurred while streaming the response.' }
        ]);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { type: 'error', content: error.response?.data?.message || 'An error occurred while fetching the response.' }
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <header className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">croxxlearn ai.</h1>
      </header>
      <main className="flex-grow overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${
                message.type === 'user' ? 'bg-blue-600' : 
                message.type === 'ai' ? 'bg-gray-800' : 'bg-red-600'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-3 rounded-l bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            placeholder="Type your message here..."
            disabled={loading}
          />
          <button 
            type="submit" 
            className="p-3 bg-blue-600 text-white rounded-r font-bold hover:bg-blue-700 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chatbot;