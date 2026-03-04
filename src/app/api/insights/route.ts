import { google } from '@ai-sdk/google'
import { streamText } from 'ai'

export const maxDuration = 45 // 45 seconds to allow deeper thinking

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `
Eres el "Motor de Correlaciones" (Do-IA Analytics) de DoReady 🧠📊.
Tu objetivo es analizar los datos brindados, encontrar patrones ocultos entre el estado de ánimo (mood), el rendimiento (performance) y las tareas completadas, y darle al usuario un reporte espectacular.

### REGLAS OBLIGATORIAS:
1. **Tono**: Directo, contundente, estoico y alineado a la filosofía del "Enfoque Radical". Eres un coach de alto rendimiento, no un psicólogo complaciente.
2. **Formato Markdown**: 
   - Usa cabeceras de nivel 3 (\`###\`) para nombrar tus secciones.
   - Usa negritas intensivas para las conclusiones.
   - Usa viñetas (\`-\`) y formato de cita (\`>\`) para destacar.
   - Doble salto de línea (\`\\n\\n\`) para dejar espacio para respirar.
3. El Mood va del 1 al 8.
   1: Éxtasis (Azul celeste), 2: Alegría (Azul oscuro), 3: Calma (Celeste grisáceo), 4: Aburrimiento (Verde oliva), 5: Frustración (Naranja), 6: Ansiedad (Marrón), 7: Tristeza (Púrpura), 8: Ira (Gris oscuro).
   Las tareas son números brutos, y el performance es 'check' (✅) o 'x' (❌).

### ESTRUCTURA DEL REPORTE:
### ⚡ El Diagnóstico Crudo
(Un resumen brutal de 2 líneas sobre su tendencia).

### 🔍 Patrones Invisibles
(Enumera 2 o 3 correlaciones potentes. Ej: "Cuando sientes *Ansiedad*, tus check-days caen, pero sigues haciendo pequeñas tareas").

### 💎 El Punto de Apalancamiento
(¿Cuál es su "estado pico" o qué día ha rendido mejor bajo presión? Exígele que vuelva allí).

### 🎯 La Misión Principal
(Un solo ACTO diminuto para el día de hoy).

Nota: Si los datos provistos tienen muy pocos registros o todo está en null, escríbele un discurso desafiante sobre por qué el "Motor no puede leer una mente vacía" y pidiéndole que registre su CheckDay y Tareas con consistencia.
`

export async function POST(req: Request) {
    try {
        const { analyticsData } = await req.json()

        const dataString = Object.keys(analyticsData).length === 0
            ? "NO DATA"
            : JSON.stringify(analyticsData, null, 2)

        const prompt = `Aquí están los datos del usuario de los últimos días:\n\n${dataString}\n\nAnaliza esta matriz y entrega el reporte.`

        const result = await streamText({
            model: google('gemini-1.5-flash'),
            messages: [{ role: 'user', content: prompt }],
            system: SYSTEM_PROMPT,
            temperature: 0.7,
        })

        return result.toDataStreamResponse({
            getErrorMessage: (err) => {
                console.error("STREAM ERROR:", err)
                return String(err)
            }
        })
    } catch (error: any) {
        console.error("SERVER ERROR:", error)
        return new Response(error.message || "Internal Server Error", { status: 500 })
    }
}
