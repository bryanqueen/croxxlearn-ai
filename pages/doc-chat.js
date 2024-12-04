import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Header from '@/components/Header';
import { CiCircleChevRight } from "react-icons/ci";
import { FiTrash2, FiSend, FiUpload, FiPlus, FiMenu } from "react-icons/fi";
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BottomNavbar from '@/components/BottomNavbar';
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';

// const MAX_PAGES = 50;
const LOADING_MESSAGES = [
  "We're studying your file so you don't have to do the hard work...",
  "Be patient, let us cook...",
  "Analyzing your document with the power of AI...",
  "Extracting knowledge from your file...",
  "Preparing insightful summaries just for you...",
];

export default function DocChat() {
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('summaries');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSummariesLoading, setIsSummariesLoading] = useState(false);
  const [summaryType, setSummaryType] = useState('long-form');
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();

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
  }, [sidebarOpen, router.query.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isSummariesLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isSummariesLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDocuments = async () => {
    try {
      const token = Cookies.get('authToken');
      const response = await fetch('/api/doc-chat', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const fetchedDocs = await response.json();
        setDocuments(fetchedDocs);
        
        const urlDocId = router.query.id;
        if (urlDocId) {
          const currentDoc = fetchedDocs.find(doc => doc._id === urlDocId);
          if (currentDoc) {
            setCurrentDocId(currentDoc._id);
            setSummaries(currentDoc.summaries);
            setMessages(currentDoc.messages || []);
          } else {
            setCurrentDocId(null);
            setSummaries([]);
            setMessages([]);
          }
        } else {
          setCurrentDocId(null);
          setSummaries([]);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    setIsSummariesLoading(true);
    setLoadingMessage(LOADING_MESSAGES[0]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = Cookies.get('authToken');
      const response = await fetch('/api/doc-chat/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
      }

      const result = await response.json();
      setDocuments(prev => [...prev, result.document]);
      setCurrentDocId(result.document._id);
      setSummaries(result.document.summaries);
      setMessages([]);
      router.push(`/doc-chat?id=${result.document._id}`, undefined, { shallow: true });
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setIsSummariesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentDocId) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = Cookies.get('authToken');
      const response = await fetch('/api/doc-chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          docId: currentDocId,
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const { message: aiResponse } = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setActiveTab('chat');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleSummaryTypeChange = (checked) => {
    setSummaryType(checked ? 'key-points' : 'long-form');
  };

  const formatAIResponse = (content) => {
    const renderMath = (text) => {
      const mathRegex = /\\$$(.*?)\\$$|\\\[(.*?)\\\]/gs;
      const parts = text.split(mathRegex);
  
      return parts.map((part, index) => {
        if (index % 3 === 1) {
          return <InlineMath key={index} math={part} />;
        } else if (index % 3 === 2) {
          return <BlockMath key={index} math={part} />;
        }
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

  const renderSummary = (summary) => {
    if (summaryType === 'key-points' && summary.keyPoints && summary.keyPoints.length > 0) {
      return (
        <ul className="list-disc pl-5 space-y-2">
          {summary.keyPoints.map((point, index) => (
            <li key={index}>{formatAIResponse(point)}</li>
          ))}
        </ul>
      );
    } else if (summaryType === 'key-points') {
      return <p>No key points available for this summary.</p>;
    } else {
      return formatAIResponse(summary.content);
    }
  };

  const handleNewDocChat = () => {
    setCurrentDocId(null);
    setSummaries([]);
    setMessages([]);
    setActiveTab('summaries');
    router.push('/doc-chat', undefined, { shallow: true });
  };

  const handleDeleteDoc = async () => {
    if (!docToDelete) return;

    try {
      const token = Cookies.get('authToken');
      const response = await fetch(`/api/doc-chat/${docToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc._id !== docToDelete));
        if (currentDocId === docToDelete) {
          setCurrentDocId(null);
          setSummaries([]);
          setMessages([]);
          router.push('/doc-chat', undefined, { shallow: true });
        }
      } else {
        setError('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    } finally {
      setDeleteModalOpen(false);
      setDocToDelete(null);
    }
  };

  const MAX_PAGES = 50;

  const EmptySummariesState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <FiUpload className="h-16 w-16 mb-4 text-gray-400" />
      <h2 className="text-2xl font-bold mb-2">Upload a document to get started</h2>
      <p className="text-gray-400 mb-4">
        Feed me your documents (pdf, doc, docx, text) and I will generate summaries to help you quickly understand it, then ask questions on what you are not clear on.
      </p>
      <p className="text-yellow-500 mb-4 font-semibold">
        Note: Currently, we can only process documents up to {MAX_PAGES} pages long.
      </p>
      <Button
        onClick={() => fileInputRef.current.click()}
        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
      >
        Upload Document
      </Button>
    </div>
  );

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <Header />
      <div className="flex flex-grow overflow-hidden pt-16 pb-16 md:pt-24 md:pb-0">
        <aside
          ref={sidebarRef}
          className={`fixed w-64 inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out md:w-64 bg-gray-800 p-4 overflow-y-auto shadow-md mt-16 md:mt-0 md:mb-32 z-10`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Documents</h2>
            <Button
              onClick={handleNewDocChat}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300"
            >
              <FiPlus className="h-5 w-5" />
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt"
          />
          {documents.map(doc => (
            <div 
              key={doc._id} 
              className={`flex items-center justify-between p-2 mb-2 rounded cursor-pointer ${
                currentDocId === doc._id ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              <span 
                onClick={() => {
                  setCurrentDocId(doc._id);
                  setSummaries(doc.summaries);
                  setMessages(doc.messages || []);
                  router.push(`/doc-chat?id=${doc._id}`, undefined, { shallow: true });
                }}
                className="flex-grow truncate"
              >
                {doc.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDocToDelete(doc._id);
                  setDeleteModalOpen(true);
                }}
                className="p-1 text-gray-400  hover:text-red-500 transition duration-300"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </aside>

        <main className="flex-grow overflow-hidden bg-black shadow-md ml-0 md:ml-4 rounded-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col pt-4 mx-2 md:mx-6">
            <TabsList className="px-4 py-6 items-center bg-gray-800 border-b">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="summaries">Summaries</TabsTrigger>
              <div className="flex items-center space-x-2 ml-auto">
                <Switch
                  id="summary-type"
                  checked={summaryType === 'key-points'}
                  onCheckedChange={handleSummaryTypeChange}
                />
                <Label htmlFor="summary-type" className='pr-10'>Key Points</Label>
              </div>
              <button
                ref={toggleButtonRef}
                className="md:hidden right-4 absolute p-2 bg-yellow-600 rounded-md shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <CiCircleChevRight className={`transition-transform text-black duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
              </button>
            </TabsList>
            <TabsContent value="chat" className="flex-grow overflow-y-auto p-4 pb-32">
              <div className="max-w-3xl mx-auto">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg ${
                      message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800'
                    }`}>
                      {message.role === 'assistant' 
                        ? formatAIResponse(message.content)
                        : message.content
                      }
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </TabsContent>
            <TabsContent value="summaries" className="flex-grow overflow-y-auto p-4 pb-32">
              <div className="max-w-3xl mx-auto">
                {isSummariesLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-8" />
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingMessage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="text-center text-gray-400 text-2xl font-bold"
                      >
                        {loadingMessage}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                ) : summaries.length > 0 ? (
                  summaries.map((summary, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
                      <h3 className="font-semibold mb-2">{summary.title}</h3>
                      {renderSummary(summary)}
                    </div>
                  ))
                ) : (
                  <EmptySummariesState />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <footer className="fixed bottom-14 md:bottom-14 left-0 right-0 p-2 bg-gray-800 shadow-md">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 pr-12 rounded text-white bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 resize-none overflow-y-auto"
            placeholder="Ask a question about the document..."
            disabled={loading || !currentDocId}
            rows={1}
            style={{ minHeight: '50px', maxHeight: '100px' }}
          />
          <Button 
            type="submit" 
            className="absolute p-2 right-2 bottom-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition duration-300 flex-shrink-0"
            disabled={loading || !currentDocId}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FiSend className="h-5 w-5"/>
            )}
          </Button>
        </form>
      </footer>

      <BottomNavbar />

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDoc}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive" className="fixed bottom-20 left-4 right-4 z-50 bg-red-600 text-white">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}