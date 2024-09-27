import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/Header';
import { useRouter } from 'next/router';
import BottomNavbar from '@/components/BottomNavbar';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');





  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedQuestions([]); // Clear previous questions
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
      <Header />
      <main className="flex-grow max-w-3xl mx-auto w-full pt-24 pb-24 px-4">
        <div className='flex flex-col items-center h-full mb-8'>
          <h2 className="text-3xl font-bold text-blue-400">Quizzy</h2>
          <p className='mb-4 font-bold text-center text-gray-300'>Generate AI-powered quiz on any topic of your choice</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-8 rounded-lg shadow-lg">
          <div>
            <Label htmlFor="topic" className="text-gray-300 font-semibold">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter the quiz topic"
              required
              className="mt-1 bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <Label htmlFor="numberOfQuestions" className="text-gray-300 font-semibold">Number of Questions</Label>
            <Input
              id="numberOfQuestions"
              type="number"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              min={1}
              max={20}
              required
              className="mt-1 bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <Label className="text-gray-300 font-semibold mb-2 block">Question Type</Label>
            <RadioGroup value={questionType} onValueChange={setQuestionType} className="flex space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-md">
                <RadioGroupItem value="multiple-choice" id="multiple-choice" className="text-blue-400" />
                <Label htmlFor="multiple-choice" className="text-gray-300 cursor-pointer">Multiple Choice</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-md">
                <RadioGroupItem value="theory" id="theory" className="text-blue-400" />
                <Label htmlFor="theory" className="text-gray-300 cursor-pointer">Theory</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="difficulty" className="text-gray-300 font-semibold">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
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
        
        <div className="mt-8 space-y-6 bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-white">Generated Questions</h2>
          {loading && generatedQuestions.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : generatedQuestions.length > 0 ? (
            generatedQuestions.map((q, index) => (
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
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {q.showAnswer ? 'Hide Answer' : 'View Answer'}
                </Button>
                {q.showAnswer && (
                  <div className="mt-2 text-green-400 whitespace-pre-wrap">
                    {q.type === 'multiple-choice' ? `Correct Answer: ${q.answer}` : q.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No questions generated yet. Fill out the form and click &quot;Generate Quiz&quot; to start.</p>
          )}
        </div>
      </main>
      <BottomNavbar/>
    </div>
  );
}