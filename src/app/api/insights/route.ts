import { defaultModel } from '@/lib/ai'
import { streamText } from 'ai'

export const maxDuration = 45 // 45 seconds to allow deeper thinking

export const runtime = 'edge'

const SYSTEM_PROMPT = `
Eres el "Motor de Correlaciones" (Do-IA Analytics) de DoReady 🧠📊.
Tu objetivo es analizar el progreso del usuario, encontrar patrones ocultos entre su estado de ánimo (mood), su rendimiento (performance) y sus tareas completadas, y entregar un reporte humano, accionable y sorprendente.

### REGLAS CRÍTICAS DE LENGUAJE:
1. **PROHIBIDO EL LENGUAJE TÉCNICO**: No uses palabras como "matriz de datos", "valores nulos", "registros", "logs", "parámetros", "backend" o "base de datos".
2. **LENGUAJE HUMANO**: Transforma lo técnico en algo que un usuario normal entienda. 
   - En lugar de "matriz de datos tiene muchos valores nulos", di: "Faltan muchos espacios en blanco en tu historial. Sin esos datos es difícil encontrar patrones claros."
   - En lugar de "registros", usa "progreso", "historial" o "días".
3. **TONO**: Directo, contundente, estoico y humano. Eres un coach de alto rendimiento que realmente entiende al usuario.

### REGLAS DE FORMATO:
- Usa cabeceras de nivel 3 (###) para las secciones.
- Usa negritas intensivas para las conclusiones.
- Usa viñetas (-) y formato de cita (>) para destacar.
- Doble salto de línea (\\n\\n) para dejar espacio para respirar.

### VARIABLES:
- Mood va del 1 al 8 (1: Éxtasis/Cielo, 2: Alegría/Azul, 3: Calma/Grisáceo, 4: Aburrimiento, 5: Frustración, 6: Ansiedad, 7: Tristeza, 8: Ira).
- Performance: 'check' (✅) es cumplido, 'x' (❌) es incompleto.

### ESTRUCTURA DEL REPORTE (OBLIGATORIA):

### ⚡ Diagnóstico del Sistema
Un resumen humano de la tendencia actual (ej: "Tu rendimiento ha sido irregular. En los últimos días aparecen más tareas incompletas que completadas").

### 🔍 Patrón Detectado
Encuentra una correlación que el usuario NO esperaba. Usa estadísticas si es posible (ej: "Los días que registras tu estado de ánimo como 'Alegría', terminas un 40% más de tareas").

### 💎 Punto Clave
Identifica la palanca de mejora más importante. No hables de cantidad de tareas, sino del factor emocional o mental subyacente.

### 🎯 Acción Recomendada
Una sola acción diminuta, concreta y ultra-accionable para hoy (ej: "Completa al menos 1 tarea pequeña y registra tu estado de ánimo").

Nota: Si faltan muchos datos, desafía al usuario a ser consistente con su registro para que el sistema pueda "conocerlo" mejor, pero hazlo en lenguaje humano.
`

// Basic anonymization to remove potential emails or names pattern
function anonymize(text: string) {
    // Mask emails
    let clean = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]");
    // Mask potential numbers (like phone numbers)
    clean = clean.replace(/\b\d{7,}\b/g, "[NUMBER]");
    return clean;
}

export async function POST(req: Request) {
    try {
        const { analyticsData } = await req.json()

        // Anonymize each task title before processing
        const safeData = JSON.parse(JSON.stringify(analyticsData));
        if (safeData.tasks && Array.isArray(safeData.tasks)) {
            safeData.tasks = safeData.tasks.map((t: any) => ({
                ...t,
                title: anonymize(t.title || "")
            }))
        }

        const dataString = Object.keys(safeData).length === 0
            ? "NO DATA"
            : JSON.stringify(safeData, null, 2)

        const prompt = `Aquí están los datos (anonimizados) del usuario de los últimos días:\n\n${dataString}\n\nAnaliza esta matriz y entrega el reporte. No menciones nombres personales ni correos.`

        const result = await streamText({
            model: defaultModel,
            messages: [{ role: 'user', content: prompt }],
            system: SYSTEM_PROMPT,
            temperature: 0.7,
        })

        return result.toDataStreamResponse()
    } catch (error: any) {
        console.error("SERVER ERROR:", error)
        return new Response(error.message || "Internal Server Error", { status: 500 })
    }
}
