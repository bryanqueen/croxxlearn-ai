import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (question) => {
    const userMessage = { type: 'user', content: question };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chatbot-2', { question }, {
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

  // Sample questions for students
  const sampleQuestions = [
    "How do I calculate my GPA?",
    "What are some tips for studying effectively?",
    "Can you help me with my assignment on economics?"
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <Header />
      <main className="flex-grow overflow-auto pt-32 p-4">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <h2 className="mb-4 text-lg font-semibold">Ask me anything!</h2>
              <div className="flex flex-col space-y-2">
                {sampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSubmit(question)}
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-300 text-left"
                  >
                    <span className="font-medium">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg ${
                  message.type === 'user' ? 'bg-blue-600' : 
                  message.type === 'ai' ? 'bg-gray-800' : 'bg-red-600'
                }`}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="p-4 border-t border-gray-800">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(input);
        }} className="max-w-3xl mx-auto flex">
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