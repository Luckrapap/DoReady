'use client'

import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { updateTaskStatus, deleteTask, updateTaskTitle, swapTaskPositions } from '@/app/actions/tasks'
import CreateTaskInput from './CreateTaskInput'
import EditTaskModal from './EditTaskModal'
import DailyProgress from './DailyProgress'
import { AnimatePresence, motion } from 'framer-motion'
import { Sprout } from 'lucide-react'
import TaskItem from './TaskItem'

interface Task {
    id: string
    title: string
    is_completed: boolean
    is_event?: boolean
}

interface TasksContainerProps {
    initialTasks: Task[]
    dateStr: string
    title: string
    displayDate: string
}

export default function TasksContainer({ initialTasks, dateStr, title, displayDate }: TasksContainerProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // Sync with server changes (e.g., when a new task is added or page loads)
    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    const actions = tasks.filter(t => !t.is_event)
    const events = tasks.filter(t => t.is_event)
    const pendingActions = actions.filter(t => !t.is_completed)
    const completedActions = actions.filter(t => t.is_completed)

    const completedCount = completedActions.length
    const totalCount = actions.length

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const newStatus = !currentStatus

        // Optimistic Update
        const updatedTasks = tasks.map(t =>
            t.id === id ? { ...t, is_completed: newStatus } : t
        )
        setTasks(updatedTasks)

        // Check for confetti: If we just completed a task, and now ALL are complete
        const newCompletedCount = updatedTasks.filter(t => t.is_completed).length
        if (newStatus && newCompletedCount === totalCount && totalCount > 0) {
            const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [accentColor, '#ffffff', '#a1a1aa'] 
            })
        }

        // Server Update
        const success = await updateTaskStatus(id, newStatus)
        if (!success) {
            // Revert if failed
            setTasks(tasks)
        }
    }

    const handleMoveUp = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        const list = task.is_completed ? tasks.filter(t => t.is_completed) : tasks.filter(t => !t.is_completed)
        const listIndex = list.findIndex(t => t.id === id)
        
        if (listIndex <= 0) return // Already at top
        const aboveId = list[listIndex - 1].id

        const idx1 = tasks.findIndex(t => t.id === id)
        const idx2 = tasks.findIndex(t => t.id === aboveId)

        const newTasks = [...tasks]
        newTasks[idx1] = newTasks[idx2]
        newTasks[idx2] = task
        setTasks(newTasks)

        const success = await swapTaskPositions(id, aboveId)
        if (!success) setTasks(tasks)
    }

    const handleMoveDown = async (id: string) => {
        const task = tasks.find(t => t.id === id)
        if (!task) return

        const list = task.is_completed ? tasks.filter(t => t.is_completed) : tasks.filter(t => !t.is_completed)
        const listIndex = list.findIndex(t => t.id === id)
        
        if (listIndex === -1 || listIndex === list.length - 1) return // Already at bottom
        const belowId = list[listIndex + 1].id

        const idx1 = tasks.findIndex(t => t.id === id)
        const idx2 = tasks.findIndex(t => t.id === belowId)

        const newTasks = [...tasks]
        newTasks[idx1] = newTasks[idx2]
        newTasks[idx2] = task
        setTasks(newTasks)

        const success = await swapTaskPositions(id, belowId)
        if (!success) setTasks(tasks)
    }

    const handleDelete = async (id: string) => {
        // Optimistic Update
        const updatedTasks = tasks.filter(t => t.id !== id)
        setTasks(updatedTasks)

        // Server Update
        const success = await deleteTask(id)
        if (!success) {
            // Revert if failed
            setTasks(tasks)
        }
    }

    const handleEditTask = async (id: string, newTitle: string) => {
        // Optimistic Update
        const updatedTasks = tasks.map(t =>
            t.id === id ? { ...t, title: newTitle } : t
        )
        setTasks(updatedTasks)

        // Server Update
        const success = await updateTaskTitle(id, newTitle)
        if (!success) {
            // Revert if failed
            setTasks(tasks)
        }
    }

    // filtered tasks logic moved up

    return (
        <div className="flex flex-col gap-6 h-full min-h-0">
            {/* Reactive Header */}
            <header className="mb-[4px] flex flex-col gap-1 px-3">
                <div className="flex items-end justify-between">
                    <h1 className="font-bold text-6xl md:text-8xl tracking-tighter text-zinc-900 dark:text-zinc-50 relative bottom-1.5">
                        {title}
                    </h1>
                    <div className="bg-zinc-200 dark:bg-zinc-800 rounded-full px-6 py-2.5 mt-2 mb-1 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl font-light text-zinc-600 dark:text-zinc-300">
                            {completedCount}/{totalCount}
                        </span>
                    </div>
                </div>
                <p className="text-base font-medium text-zinc-400 capitalize">{displayDate}</p>
            </header>

            <div className="px-3">
                <CreateTaskInput dateStr={dateStr} />
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto flex-1 min-h-0 pb-20 px-3">
                {tasks.length === 0 ? (
                    <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 rounded-[32px] gap-6"
                    style={{
                        backgroundColor: 'color-mix(in srgb, var(--surface) 20%, transparent)'
                    }}
                >
                    <div className="w-20 h-20 flex items-center justify-center rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                        <Sprout className="text-zinc-800 dark:text-zinc-200" size={40} strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xl tracking-tight">Empieza por una tarea.</p>
                        <p className="text-base text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-[260px]">¿Añadimos algo más?</p>
                    </div>
                </motion.div>
            ) : (
                <div className="flex flex-col gap-5">
                    {/* ACCIONES Section */}
                    {(pendingActions.length > 0 || completedActions.length > 0) && (
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ml-1">
                                Acciones
                            </h2>

                            {pendingActions.length > 0 && (
                                <div>
                                    <h3 className="text-[17px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">
                                        Pendientes
                                    </h3>
                                    <div className="flex flex-col gap-2.5">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {pendingActions.map((task) => (
                                                <TaskItem
                                                    key={task.id}
                                                    task={task}
                                                    onToggle={() => handleToggle(task.id, task.is_completed)}
                                                    onDelete={() => handleDelete(task.id)}
                                                    onClick={() => setEditingTask(task)}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {completedActions.length > 0 && (
                                <div>
                                    <h3 className="text-[17px] font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">
                                        Completadas
                                    </h3>
                                    <div className="flex flex-col gap-2.5">
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            {completedActions.map((task) => (
                                                <TaskItem
                                                    key={task.id}
                                                    task={task}
                                                    onToggle={() => handleToggle(task.id, task.is_completed)}
                                                    onDelete={() => handleDelete(task.id)}
                                                    onClick={() => setEditingTask(task)}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* EVENTOS Section */}
                    {events.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 ml-1">
                                Eventos
                            </h2>
                            <div className="flex flex-col gap-2.5">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {events.map((task) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            onToggle={() => handleToggle(task.id, task.is_completed)}
                                            onDelete={() => handleDelete(task.id)}
                                            onClick={() => setEditingTask(task)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            )}
            </div>

            <EditTaskModal 
                task={editingTask} 
                isOpen={!!editingTask} 
                onClose={() => setEditingTask(null)} 
                onSave={handleEditTask} 
                onDelete={handleDelete}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
            />
        </div>
    )
}
