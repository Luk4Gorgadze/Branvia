import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function testGemini() {
    try {
        console.log('🤖 Testing Gemini API...');
        console.log('API Key:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Say 'Hello from Gemini!' in a creative way.";

        console.log('📝 Sending prompt:', prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;

        console.log('✅ Gemini Response:', response.text());
        console.log('🎉 Gemini API is working!');

    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        console.error('Full error:', error);
    }
}

testGemini(); 