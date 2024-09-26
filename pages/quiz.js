import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/Header';


export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');




  
  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
    const token = Cookies.get('authToken');
      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
 
      } else {
        console.error('Failed to fetch user credits');
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          numberOfQuestions,
          questionType,
          difficulty,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      setGeneratedQuestions(data.questions);
    } catch (error) {
        setError(error.message)
      console.error('Error generating quiz:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setGeneratedQuestions(prevQuestions => 
      prevQuestions.map((q, i) => 
        i === index ? { ...q, showAnswer: !q.showAnswer } : q
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Header/>
      <main className="flex-grow max-w-3xl mx-auto w-full pt-24 px-4">
      <div className='flex flex-col items-center h-full'>
      <h2 className="text-2xl font-bold">Quizzy</h2>
      <p className='mb-4 font-bold text-center text-sm'>Generate AI-powered quiz on any topic of your choice</p>
      </div>
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg shadow-lg">
          <div>
            <Label htmlFor="topic" className="text-white">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the quiz topic"
              required
              className="bg-gray-800 text-white border-gray-700"
            />
          </div>
          
          <div>
            <Label htmlFor="numberOfQuestions" className="text-white">Number of Questions</Label>
            <Input
              id="numberOfQuestions"
              type="number"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              min={1}
              max={20}
              required
              className="bg-gray-800 text-white border-gray-700"
            />
          </div>
          
          <div>
            <Label className="text-white">Question Type</Label>
            <RadioGroup value={questionType} onValueChange={setQuestionType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="multiple-choice" id="multiple-choice"  />
                <Label htmlFor="multiple-choice" className="text-white">Multiple Choice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="theory" id="theory" />
                <Label htmlFor="theory" className="text-white">Theory</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              'Generate Quiz'
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {generatedQuestions.length > 0 && (
          <div className="mt-8 space-y-6 bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-white">Generated Questions</h2>
            {generatedQuestions.map((q, index) => (
              <div key={index} className="border border-gray-700 p-4 rounded-md">
                <p className="font-semibold text-white">{`Question ${index + 1}: ${q.question}`}</p>
                {q.type === 'multiple-choice' && (
                  <ul className="list-disc pl-6 mt-2 text-gray-300">
                    {q.choices.map((choice, choiceIndex) => (
                      <li key={choiceIndex}>{choice}</li>
                    ))}
                  </ul>
                )}
                <Button 
                  onClick={() => toggleAnswer(index)} 
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  {q.showAnswer ? 'Hide Answer' : 'View Answer'}
                </Button>
                {q.showAnswer && (
                  <div className="mt-2 text-green-400 whitespace-pre-wrap">
                    {q.type === 'multiple-choice' ? `Correct Answer: ${q.answer}` : q.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}