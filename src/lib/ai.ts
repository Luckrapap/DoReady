import { createOpenAI } from '@ai-sdk/openai';

const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

// Definición de modelos para rotación automática (Definitive Solution)
export const models = {
    primary: groq('llama-3.3-70b-versatile'),
    secondary: groq('llama-3.1-70b-versatile'),
    fast: groq('llama-3.1-8b-instant'),
    extra: groq('gemma2-9b-it')
};

export const defaultModel = models.primary;
