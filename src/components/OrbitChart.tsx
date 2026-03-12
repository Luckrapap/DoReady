'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Pencil } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function OrbitChart() {
    const [mounted, setMounted] = useState(false)
    const params = useParams()
    const habitId = params.id as string

    const [bubbles, setBubbles] = useState<Record<number, string>>({
        1: '',
        2: '',
        3: ''
    })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeBubbleId, setActiveBubbleId] = useState<number | null>(null)
    const [tempText, setTempText] = useState('')

    useEffect(() => {
        setMounted(true)
        if (habitId) {
            const saved = localStorage.getItem(`orbit_bubbles_${habitId}`)
            if (saved) {
                try {
                    setBubbles(JSON.parse(saved))
                } catch (e) {
                    console.error("Failed to parse saved bubbles")
                }
            }
        }
    }, [habitId])

    useEffect(() => {
        if (mounted && habitId) {
            localStorage.setItem(`orbit_bubbles_${habitId}`, JSON.stringify(bubbles))
        }
    }, [bubbles, habitId, mounted])

    const openModal = (id: number) => {
        setActiveBubbleId(id)
        setTempText(bubbles[id] || '')
        setIsModalOpen(true)
    }

    const saveText = () => {
        if (activeBubbleId !== null) {
            setBubbles(prev => ({ ...prev, [activeBubbleId]: tempText }))
        }
        setIsModalOpen(false)
    }

    const deleteText = () => {
        if (activeBubbleId !== null) {
            setBubbles(prev => ({ ...prev, [activeBubbleId]: '' }))
        }
        setIsModalOpen(false)
    }

    // Basic sine wave parameters
    const width = 950
    const height = 540
    const amplitude = 125
    const yOffset = height / 2
    const axisX = 40
    
    // We want the wave to start and end at the exact same distance from the edges for symmetry
    const endX = width - axisX
    const relEndX = endX - axisX 
    
    // Frequency adjusted so that we finish exactly at 2 full cycles (the trough)
    const frequency = (4 * Math.PI) / relEndX 
    const slope = -35 

    // Generate points for the sine wave 
    const points: { x: number, y: number }[] = []
    for (let x = axisX + 3; x <= endX; x += 1) {
        const relativeX = x - axisX
        const meanY = yOffset + (slope * (relativeX / relEndX))
        const y = parseFloat((meanY + amplitude * Math.cos(frequency * relativeX)).toFixed(2))
        points.push({ x, y })
    }

    const generateSegments = () => {
        const segments = []
        if (points.length === 0) return []
        
        let currentPath = `M ${points[0].x} ${points[0].y}`
        let isRisingVisually = true 

        for (let i = 1; i < points.length; i++) {
            const relX = points[i].x - axisX
            const nextIsRising = Math.sin(frequency * relX) > 0
            
            if (nextIsRising !== isRisingVisually) {
                segments.push({
                    d: currentPath + ` L ${points[i].x} ${points[i].y}`,
                    color: isRisingVisually ? '#4ade80' : '#f87171' 
                })
                currentPath = `M ${points[i].x} ${points[i].y}`
                isRisingVisually = nextIsRising
            } else {
                currentPath += ` L ${points[i].x} ${points[i].y}`
            }
        }
        
        segments.push({
            d: currentPath,
            color: isRisingVisually ? '#4ade80' : '#f87171'
        })

        return segments
    }

    const segments = generateSegments()

    if (!mounted) return (
        <div className="w-full aspect-[1.6/1] bg-transparent p-8 relative overflow-hidden flex items-center justify-center">
            <div className="animate-pulse text-zinc-400 font-bold text-xl">Cargando gráfico...</div>
        </div>
    )

    return (
        <div className="w-full h-full p-8 relative overflow-visible flex items-center justify-center">
            <svg 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full h-full overflow-visible"
            >
                {/* Wave Segments */}
                {segments.map((seg, i) => (
                    <motion.path
                        key={i}
                        d={seg.d}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                    />
                ))}

                {/* Speech Bubbles */}
                {/* Peak Bubble (ID 1) */}
                <g 
                    transform={`translate(${axisX + relEndX * 0.25}, ${yOffset + (slope * 0.25) - amplitude})`}
                    className="cursor-pointer"
                    onClick={() => openModal(1)}
                >
                    <motion.g
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.2, duration: 0.4 }}
                        className="hover:scale-110 transition-transform duration-200"
                        style={{ transformOrigin: '0px 0px' }}
                    >
                        <path d="M 12 -23 L 0 0 L 52 -23 Z" className="fill-zinc-400 dark:fill-zinc-500" />
                        <rect x="-15" y="-100" width="190" height="80" rx="16" className="fill-zinc-400 dark:fill-zinc-500" />
                        <foreignObject x="-15" y="-100" width="190" height="80" className="pointer-events-none">
                            <div className="w-full h-full flex items-center justify-center p-4">
                                {bubbles[1] ? (
                                    <span className={`text-white text-center font-medium line-clamp-3 break-words text-balance px-1 w-full ${bubbles[1].length > 70 ? 'text-sm leading-tight' : bubbles[1].length > 45 ? 'text-base leading-snug' : bubbles[1].length > 25 ? 'text-lg leading-snug' : bubbles[1].length > 10 ? 'text-xl leading-snug' : 'text-3xl'}`}>{bubbles[1]}</span>
                                ) : (
                                    <Plus className="text-white w-12 h-12 opacity-80" strokeWidth={3} strokeLinecap="round" />
                                )}
                            </div>
                        </foreignObject>
                    </motion.g>
                </g>

                {/* Middle Rising Bubble (ID 2) */}
                <g 
                    transform={`translate(${axisX + relEndX * 0.615}, ${yOffset + (slope * 0.615)})`}
                    className="cursor-pointer"
                    onClick={() => openModal(2)}
                >
                    <motion.g
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 1.8, duration: 0.4 }}
                        className="hover:scale-110 transition-transform duration-200"
                        style={{ transformOrigin: '0px 0px' }}
                    >
                        <path d="M 12 -23 L 0 0 L 52 -23 Z" className="fill-zinc-400 dark:fill-zinc-500" />
                        <rect x="-15" y="-100" width="190" height="80" rx="16" className="fill-zinc-400 dark:fill-zinc-500" />
                        <foreignObject x="-15" y="-100" width="190" height="80" className="pointer-events-none">
                            <div className="w-full h-full flex items-center justify-center p-4">
                                {bubbles[2] ? (
                                    <span className={`text-white text-center font-medium line-clamp-3 break-words text-balance px-1 w-full ${bubbles[2].length > 70 ? 'text-sm leading-tight' : bubbles[2].length > 45 ? 'text-base leading-snug' : bubbles[2].length > 25 ? 'text-lg leading-snug' : bubbles[2].length > 10 ? 'text-xl leading-snug' : 'text-3xl'}`}>{bubbles[2]}</span>
                                ) : (
                                    <Plus className="text-white w-12 h-12 opacity-80" strokeWidth={3} strokeLinecap="round" />
                                )}
                            </div>
                        </foreignObject>
                    </motion.g>
                </g>

                {/* Trough Bubble (ID 3) */}
                <g 
                    transform={`translate(${axisX + relEndX * 0.5}, ${yOffset + (slope * 0.5) + amplitude})`}
                    className="cursor-pointer"
                    onClick={() => openModal(3)}
                >
                    <motion.g
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.5, duration: 0.4 }}
                        className="hover:scale-110 transition-transform duration-200"
                        style={{ transformOrigin: '0px 0px' }}
                    >
                        <path d="M 12 23 L 0 0 L 52 23 Z" className="fill-zinc-400 dark:fill-zinc-500" />
                        <rect x="-15" y="20" width="190" height="80" rx="16" className="fill-zinc-400 dark:fill-zinc-500" />
                        <foreignObject x="-15" y="20" width="190" height="80" className="pointer-events-none">
                            <div className="w-full h-full flex items-center justify-center p-4">
                                {bubbles[3] ? (
                                    <span className={`text-white text-center font-medium line-clamp-3 break-words text-balance px-1 w-full ${bubbles[3].length > 70 ? 'text-sm leading-tight' : bubbles[3].length > 45 ? 'text-base leading-snug' : bubbles[3].length > 25 ? 'text-lg leading-snug' : bubbles[3].length > 10 ? 'text-xl leading-snug' : 'text-3xl'}`}>{bubbles[3]}</span>
                                ) : (
                                    <Plus className="text-white w-12 h-12 opacity-80" strokeWidth={3} strokeLinecap="round" />
                                )}
                            </div>
                        </foreignObject>
                    </motion.g>
                </g>

                {/* Axes */}
                <line 
                    x1={axisX} y1="40" x2={axisX} y2={height - 40} 
                    stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                    className="text-zinc-900 dark:text-zinc-100"
                />
                <line 
                    x1={axisX - 20} y1={yOffset} x2={width - 20} y2={yOffset + slope} 
                    stroke="currentColor" strokeWidth="4" strokeDasharray="4 8" strokeLinecap="round"
                    className="text-zinc-500 dark:text-zinc-400 opacity-80"
                />

                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" className="fill-zinc-900 dark:fill-zinc-100" />
                    </marker>
                </defs>
            </svg>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            className="w-full max-w-lg h-fit border rounded-[2.5rem] shadow-2xl overflow-hidden transition-colors duration-500"
                            style={{ backgroundColor: 'var(--surface, #f0f4f8)', borderColor: 'var(--border, #e2e8f0)' }}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-2xl transition-colors duration-500"
                                            style={{ backgroundColor: 'var(--border, #e2e8f0)', color: 'var(--accent, #3b82f6)' }}
                                        >
                                            <Pencil size={20} />
                                        </div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Editar Órbita</h2>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 rounded-full transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                                        style={{ backgroundColor: 'transparent' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-500 mb-2 px-1">Nombre de la Órbita</label>
                                        <textarea
                                            autoFocus
                                            value={tempText}
                                            onChange={(e) => setTempText(e.target.value)}
                                            placeholder="Nombre de tu órbita"
                                            className="w-full p-4 rounded-2xl border-none transition-all text-sm text-zinc-900 dark:text-zinc-50 outline-none resize-none min-h-[80px]"
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--surface, #f0f4f8) 90%, var(--accent, #3b82f6))' }}
                                        />
                                    </div>

                                    <div className="pt-4 flex justify-center gap-3 w-full">
                                        <button
                                            onClick={deleteText}
                                            className="w-[140px] flex items-center justify-center gap-2 py-4 text-red-600 dark:text-red-400 rounded-[2rem] font-bold text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            style={{ backgroundColor: 'color-mix(in srgb, var(--surface, #f0f4f8) 95%, #ef4444)' }}
                                        >
                                            Eliminar
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            onClick={saveText}
                                            className="w-[140px] flex items-center justify-center gap-2 py-4 text-white rounded-[2rem] font-bold text-sm tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                                            style={{ backgroundColor: 'var(--accent, #3b82f6)' }}
                                        >
                                            Guardar
                                            <Pencil size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
