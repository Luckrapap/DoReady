import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30
export const runtime = 'nodejs'

const TriviaSchema = z.object({
    question: z.string().describe("A rigorous or curious general culture question."),
    options: z.array(z.string()).length(4).describe("4 possible answers."),
    correctAnswer: z.string().describe("The exact string of the correct option."),
    explanation: z.string().describe("A short, fun fact explaining the answer.")
})

export type TriviaResponse = z.infer<typeof TriviaSchema>

export async function POST(req: Request) {
    try {
        const { topic } = await req.json()

        const prompt = `
            Genera una pregunta de cultura general fascinante y no trivial. 
            Asegúrate de que la pregunta sea sobre ${topic ? 'el tema: ' + topic : 'un tema aleatorio al azar (historia, ciencia, arte, geografía, psicología, pop culture)'}.
            La respuesta correcta debe estar EXACTAMENTE como uno de los elementos en el array de 'options'.
            Evita repetir preguntas comunes. Hazla interesante, algo que valga la pena aprender.
            Responde SIEMPRE en Español.
        `

        const { object } = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: TriviaSchema,
            prompt: prompt,
            temperature: 0.9,
        })

        return new Response(JSON.stringify(object), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error: any) {
        console.error("TRIVIA API CRITICAL ERROR:", error)
        return new Response(JSON.stringify({
            error: error.message || "Internal Server Error",
            details: error.toString()
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
