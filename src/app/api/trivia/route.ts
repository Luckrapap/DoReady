import { models } from '@/lib/ai'
import { generateObject } from 'ai'
import { z } from 'zod'

export const maxDuration = 30
export const runtime = 'nodejs'

const TriviaSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
    explanation: z.string(),
    funFact: z.string()
})

export type TriviaResponse = z.infer<typeof TriviaSchema>

const TOPICS = [
    "Historia", "Ciencia", "Tecnología", "Arte", "Cultura", "Música", "Cine", "Geografía", "Deportes", "Mitología"
]

export async function POST(req: Request) {
    const { topic, mode = 'random' } = await req.json()
    const randomSubTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
    const selectedTopic = topic ? `tema: ${topic}` : `nicho: ${randomSubTopic}`

    let difficulty = "MIXTA";
    if (mode === 'chill') difficulty = "FÁCIL (curiosa, amena)";
    else if (mode === 'expert') difficulty = "EXTREMA (muy específica)";

    const prompt = `Trivia sobre ${selectedTopic}. MODO: ${mode.toUpperCase()}. DIFICULTAD: ${difficulty}. REGLAS: 1. Dato inesperado/curioso. 2. Respuesta en 'options'. 3. Español. Solo JSON.`

    // Lista de modelos para rotación automática si uno falla por límite de tokens
    const modelsToTry = [models.primary, models.secondary, models.fast, models.extra];

    for (const model of modelsToTry) {
        try {
            const { object } = await generateObject({
                model,
                schema: TriviaSchema,
                mode: 'json',
                prompt,
                temperature: 0.5,
            })
            return new Response(JSON.stringify(object), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        } catch (error: any) {
            console.warn(`Model ${model.modelId} failed, trying next... Error:`, error.message)
            // Si es el último modelo, lanzamos el error
            if (model === modelsToTry[modelsToTry.length - 1]) {
                return new Response(JSON.stringify({ error: "Límite de IA alcanzado en todos los modelos. Espera unos segundos." }), { 
                    status: 429,
                    headers: { 'Content-Type': 'application/json' }
                })
            }
            continue; // Prueba el siguiente modelo
        }
    }
}
