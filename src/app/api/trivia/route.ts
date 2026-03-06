import { defaultModel } from '@/lib/ai'
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

const TOPICS = [
    "Historia de la Gastronomía", "Mitología Comparada", "Exploración Espacial (Misiones fallidas)",
    "Biología Marina de las Profundidades", "Evolución de los Lenguajes de Programación",
    "Arquitectura Brutalista", "Historia de la Criptografía", "Psicología del Color",
    "Grandes Extinciones Masivas", "Instrumentos Musicales Antiguos", "Curiosidades de la Física Cuántica",
    "Historia del Cine Mudo", "Botánica (Plantas Carnívoras y Parásitas)", "Neurociencia de los Sueños",
    "Grandes Rutas Comerciales de la Historia", "Anatomía Comparada", "Historia de la Aviación",
    "Mitología Nórdica y Celta", "Inventos Accidentales que cambiaron el mundo", "Geología de Volcanes",
    "Historia de la Inteligencia Artificial", "Criminología Histórica", "Grandes Exploradores del Ártico",
    "Microbiología y Virus curiosos", "Historia de la Escritura y Alfabetos", "Evolución de la Moda",
    "Juegos de Mesa Antiguos", "Historia de la Medicina (Prácticas extrañas)", "Física de Partículas",
    "Ecología de Ecosistemas Extremos", "Filosofía del Estoicismo", "Historia de la Animación"
]

export async function POST(req: Request) {
    try {
        const { topic } = await req.json()

        // Pick a random sub-topic if none is provided to force variety
        const randomSubTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
        const selectedTopic = topic ? `el tema específico: ${topic}` : `el nicho de: ${randomSubTopic}`

        const prompt = `
            Eres un experto en curiosidades y cultura general. Tu objetivo es generar una pregunta fascinante, 
            extremadamente específica y poco común sobre ${selectedTopic}.
            
            REGLAS CRÍTICAS:
            1. NO hagas preguntas típicas (ej: capitales, años de guerras famosas, nombres de planetas).
            2. Busca el dato "curioso" o la "historia oculta". Algo que sea un reto hasta para expertos.
            3. La respuesta correcta debe estar EXACTAMENTE como uno de los elementos en el array de 'options'.
            4. El dato curioso (explanation) debe ser sorprendente y explicar el contexto de la respuesta.
            5. Responde SIEMPRE en Español.
            
            Estás prohibido de repetir preguntas sobre la Gran Muralla China, el Titanic, Einstein o la Mona Lisa a menos que sea un dato extremadamente desconocido.
        `

        const { object } = await generateObject({
            model: defaultModel,
            schema: TriviaSchema,
            prompt: prompt,
            temperature: 0.95, // Higher temperature for more creativity
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
