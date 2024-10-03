import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Header from '@/components/Header';
import { CiCircleChevRight } from "react-icons/ci";
import { FiTrash2, FiSend } from "react-icons/fi";
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BottomNavbar from '@/components/BottomNavbar';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Textarea } from "@/components/ui/textarea";

function Chatbot({chat}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const textareaRef = useRef(null);
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const sampleQuestions = [
    "What are the key differences between a thesis and a dissertation?",
    "How can I improve my time management skills for better academic performance?",
    "What are some effective strategies for writing a research paper?",
    "How do I choose the right major for my career goals?",
    "What are the benefits of participating in extracurricular activities in college?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input])

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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const fetchChats = async () => {
    if (!isInitialLoad) setIsLoading(true);
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
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleSubmit = async (e, questionText = null) => {
    e.preventDefault();
    const submittedInput = questionText || input;
    if (!submittedInput.trim()) return;

    const userMessage = { role: 'user', content: submittedInput };
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
          question: submittedInput,
          isNewChat: !currentChatId
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
              if (!currentChatId){
                fetchChats();
              }
              break;
            }
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.chatId && !currentChatId) {
                setCurrentChatId(parsedData.chatId);
                const newChat = { _id: parsedData.chatId, title: parsedData.title || 'New Chat', messages: [userMessage] };
                setChats((prevChats) => [newChat, ...prevChats]);
                router.push(`/chatbot?id=${parsedData.chatId}`, undefined, { shallow: true });
              } else if (typeof parsedData === 'string') {
                aiMessage.content += parsedData;
                setMessages((prevMessages) => [
                  ...prevMessages.slice(0, -1),
                  { ...aiMessage },
                ]);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching response:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : String(error)}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`/api/chatbot/${chatToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setChats((prevChats) => prevChats.filter((chat) => chat._id !== chatToDelete));
        if (currentChatId === chatToDelete) {
          setCurrentChatId(null);
          setMessages([]);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete chat:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    } finally {
      setDeleteModalOpen(false);
      setChatToDelete(null);
    }
  };

  const formatAIResponse = (content) => {
    const renderMath = (text) => {
      // Regular expression to match LaTeX-style math expressions
      const mathRegex = /\\$$(.*?)\\$$|\\\[(.*?)\\\]/gs;
      const parts = text.split(mathRegex);
  
      return parts.map((part, index) => {
        if (index % 3 === 1) {
          // Inline math
          return <InlineMath key={index} math={part} />;
        } else if (index % 3 === 2) {
          // Display (block) math
          return <BlockMath key={index} math={part} />;
        }
        // Regular text
        return part;
      });
    };
  
    const renderElement = (element, index) => {
      if (typeof element === 'string') {
        if (element.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{element.slice(4)}</h3>;
        }
        
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = element.split(boldRegex);
        
        return (
          <span key={index}>
            {parts.map((part, i) => 
              i % 2 === 0 ? renderMath(part) : <strong key={i}>{renderMath(part)}</strong>
            )}
          </span>
        );
      }
      return element;
    };
  
    const paragraphs = content.split('\n\n');
  
    return paragraphs.map((paragraph, index) => {
      const lines = paragraph.split('\n');
      const formattedLines = lines.map((line, lineIndex) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {renderElement(line, lineIndex)}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      ));
  
      return <p key={index} className="mb-4">{formattedLines}</p>;
    });
  };

  if (isLoading && isInitialLoad) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <Header />
      <div className="flex flex-grow overflow-hidden pt-16 pb-10 md:pt-24">
        <button
          ref={toggleButtonRef}
          className="md:hidden fixed top-20 left-0 z-20 p-2 bg-yellow-600 rounded-md shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <CiCircleChevRight className={`transition-transform text-black duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>

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
            onClick={() => {
              setCurrentChatId(null);
              setMessages([]);
              router.push('/chatbot', undefined, {shallow: true})
            }}
            className="w-full p-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
          >
            New Chat
          </button>
          {chats.map(chat => (
            <div 
              key={chat._id} 
              className={`flex items-center justify-between p-2 mb-2 rounded cursor-pointer ${
                currentChatId === chat._id ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <span 
                onClick={() => {
                  setCurrentChatId(chat._id);
                  setMessages(chat.messages || []);
                  router.push(`/chatbot?id=${chat._id}`, undefined, { shallow: true });
                }}
                className="flex-grow"
              >
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setChatToDelete(chat._id);
                  setDeleteModalOpen(true);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition duration-300"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </aside>

        <main className="flex-grow overflow-y-auto p-4 pb-36">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <h2 className="text-3xl font-bold text-blue-400">CroxxChat</h2>
                <p className='mb-4 font-bold text-center text-gray-300'>Chat me about any of your academic topics😉</p>
                <div className="space-y-2">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={(e) => handleSubmit(e, question)}
                      className="w-full p-2 text-left bg-gray-800 hover:bg-gray-700 rounded transition duration-300"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'
                  }`}>
                  {message.role === 'assistant' 
                ? formatAIResponse(message.content)
                : message.content
              }
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
      </div>

      <footer className="fixed bottom-14 left-0 right-0 p-1.5 border-t border-gray-800 bg-black">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="w-full p-2 pr-12 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 resize-none overflow-y-auto"
            placeholder="Type your message here..."
            disabled={loading}
            rows={1}
            style={{ minHeight: '50px', maxHeight: '100px' }}
          />
          <Button 
            type="submit" 
            className="absolute p-2 right-2.5 md:right-8 items-center  bottom-1  bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition duration-300 flex-shrink-0"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FiSend className='w-5 h-5'/>
            )}
          </Button>
        </form>
      </footer>

      <BottomNavbar/>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Chatbot;

// export function