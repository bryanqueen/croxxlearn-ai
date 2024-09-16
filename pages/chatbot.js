import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import Header from '@/components/Header';
import { CiCircleChevRight } from "react-icons/ci";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    fetchChats();

    const handleClickOutside = (event) => {
      if (
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) && 
        !toggleButtonRef.current.contains(event.target) && 
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const fetchChats = async () => {
    try {
      const token = Cookies.get('authToken');
      const response = await fetch('/api/chatbot', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const fetchedChats = await response.json();
        setChats(fetchedChats);
        if (fetchedChats.length > 0 && !currentChatId) {
          setCurrentChatId(fetchedChats[0]._id);
          setMessages(fetchedChats[0].messages);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleSubmit = async (question) => {
    const userMessage = { role: 'user', content: question };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);
  
    try {
      const token = Cookies.get('authToken');
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: currentChatId,
          question: question,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
  
      let aiMessage = { role: 'assistant', content: '' };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
  
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
  
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setLoading(false);
              break;
            }
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.chatId && !currentChatId) {
                setCurrentChatId(parsedData.chatId);
                const newChat = { _id: parsedData.chatId, title: 'New Chat', messages: [userMessage] };
                setChats((prevChats) => [newChat, ...prevChats]);
              } else if (parsedData.error) {
                throw new Error(parsedData.error);
              } else {
                aiMessage.content += data;
                setMessages((prevMessages) => [
                  ...prevMessages.slice(0, -1),
                  { ...aiMessage },
                ]);
              }
            } catch (e) {
              aiMessage.content += data;
              setMessages((prevMessages) => [
                ...prevMessages.slice(0, -1),
                { ...aiMessage },
              ]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: `Error: ${error.message}` },
      ]);
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleChatSwitch = (chatId) => {
    const selectedChat = chats.find(chat => chat._id === chatId);
    if (selectedChat) {
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages || []);
    }
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const formatAIResponse = (content) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, index) => {
      if (/^\d+\./.test(paragraph)) {
        const listItems = paragraph.split('\n');
        return (
          <ol key={index} className="list-decimal list-inside mb-4">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="mb-1">{item.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        );
      } else {
        return <p key={index} className="mb-4">{paragraph}</p>;
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <Header />
      <div className="flex-grow flex overflow-hidden pt-16">
        {/* Sidebar toggle button */}
        <button
          ref={toggleButtonRef}
          className="md:hidden fixed top-20 left-4 z-20 p-2 bg-gray-800 rounded-full shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <CiCircleChevRight className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Responsive sidebar */}
        <aside
          ref={sidebarRef}
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            fixed md:static
            top-16 bottom-0 left-0
            w-64 bg-gray-900 p-4 overflow-y-auto
            transition-transform duration-300 ease-in-out
            z-10 md:z-0
          `}
        >
          <button 
            onClick={handleNewChat}
            className="w-full p-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
          >
            New Chat
          </button>
          {chats.map(chat => (
            <div 
              key={chat._id} 
              onClick={() => handleChatSwitch(chat._id)}
              className={`p-2 mb-2 rounded cursor-pointer ${
                currentChatId === chat._id ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              {chat.title}
            </div>
          ))}
        </aside>

        {/* Main chat area */}
        <main className="flex-grow overflow-auto p-4 md:ml-64 pb-20">
          <div className="max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'
                }`}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none">
                      {formatAIResponse(message.content)}
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black">
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
}
export default Chatbot;