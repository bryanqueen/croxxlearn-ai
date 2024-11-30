import OpenAI from 'openai';
import { verifyToken } from '@/lib/auth';
import connectMongo from '@/lib/mongodb';
import User from '@/model/User';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function cleanText(text) {
    return text.replace(/^#+\s*/, '').replace(/\*\*/g, '');
}

function parseQuestions(content, questionType) {
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    let questions = [];
    let currentQuestion = null;

    for (const line of lines) {
        if (line.match(/^Question \d+:/)) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = { 
                question: cleanText(line.replace(/^Question \d+:\s*/, '')), 
                type: questionType,
                choices: [],
                answer: '' 
            };
        } else if (questionType === 'multiple-choice' && line.match(/^[A-D]\)/)) {
            currentQuestion.choices.push(cleanText(line));
        } else if (line.startsWith('Answer:') || line.startsWith('Correct Answer:')) {
            currentQuestion.answer = cleanText(line.replace(/^(Answer:|Correct Answer:)\s*/, ''));
        } else if (currentQuestion && currentQuestion.answer !== undefined) {
            if (questionType === 'theory') {
                currentQuestion.answer += cleanText(line) + '\n';
            }
        }
    }

    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    return questions.map(q => ({...q, answer: q.answer.trim()}));
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { topic, numberOfQuestions, questionType, difficulty } = req.body;

    if (!topic || !numberOfQuestions || !questionType || !difficulty) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {

        const decoded = await verifyToken(token);
        await connectMongo();

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Calculate required credits
        const creditsPerQuestion = questionType === 'multiple-choice' ? 5 : 5;
        const requiredCredits = numberOfQuestions * creditsPerQuestion;

        // Check if user has enough credits
        if (user.credits < requiredCredits) {
            return res.status(403).json({ error: 'Insufficient credits' });
        }
        
        let prompt;
        if (questionType === 'multiple-choice') {
            prompt = `Generate ${numberOfQuestions} ${difficulty} multiple-choice questions about ${topic}. For each question, provide 4 options and the correct answer. Format each question as follows:
            Question 1: [Question text]
            A) [Option A]
            B) [Option B]
            C) [Option C]
            D) [Option D]
            Correct Answer: [Correct answer]`;
        } else {
            prompt = `Generate ${numberOfQuestions} ${difficulty} theory questions about ${topic}. For each question, provide a detailed answer that a student would be expected to give in an exam. Format each question as follows:
            Question 1: [Question text]
            Answer: [Detailed answer]`;
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: 'system', content: prompt }
            ],
            max_tokens: 4000,
            temperature: 0.7,
        });

        const content = response.choices[0].message.content;
        const questions = parseQuestions(content, questionType);

        // Deduct credits
        user.credits -= requiredCredits;
        await user.save();

        res.status(200).json({ questions});
    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
}