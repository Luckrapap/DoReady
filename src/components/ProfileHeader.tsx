'use client'

import { useState, useRef } from 'react'
import { User, Pencil, Check, X, Camera, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, updateAvatarUrl } from '@/app/actions/profile'
import Image from 'next/image'

interface ProfileHeaderProps {
    profile: {
        id: string
        full_name: string | null
        avatar_url: string | null
        gender?: string | null
        birth_date?: string | null
    } | null
    email: string
    isGuest?: boolean
}

export default function ProfileHeader({ profile, email, isGuest = false }: ProfileHeaderProps) {
    const [isEditingName, setIsEditingName] = useState(false)
    const [newName, setNewName] = useState(profile?.full_name || email.split('@')[0])
    const [isUploading, setIsUploading] = useState(false)
    const [isSavingName, setIsSavingName] = useState(false)
    const [isEditingGender, setIsEditingGender] = useState(false)
    const [isEditingBirthDate, setIsEditingBirthDate] = useState(false)
    const [tempGender, setTempGender] = useState(profile?.gender || '')
    const [tempBirthDate, setTempBirthDate] = useState(profile?.birth_date || '')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleNameSave = async () => {
        if (!newName.trim()) return
        setIsSavingName(true)
        const result = await updateProfile({ full_name: newName })
        if (result.success) {
            setIsEditingName(false)
        } else {
            alert(`Error al guardar el nombre: ${result.error || 'Error desconocido'}`)
        }
        setIsSavingName(false)
    }

    const handleGenderSave = async () => {
        setIsSavingName(true)
        const result = await updateProfile({ gender: tempGender })
        if (result.success) {
            setIsEditingGender(false)
        } else {
            alert(`Error al guardar el género: ${result.error || 'Error desconocido'}`)
        }
        setIsSavingName(false)
    }

    const handleBirthDateSave = async () => {
        setIsSavingName(true)
        const result = await updateProfile({ birth_date: tempBirthDate })
        if (result.success) {
            setIsEditingBirthDate(false)
        } else {
            alert(`Error al guardar la fecha: ${result.error || 'Error desconocido'}`)
        }
        setIsSavingName(false)
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // ... (existing logic)
    }

    return (
        <div className="border rounded-3xl p-10 shadow-sm mb-8 transition-colors duration-500"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
            <div className="flex flex-col md:flex-row items-center gap-10">
                {/* Avatar Section */}
                <div className="relative group">
                    <div
                        onClick={() => {
                            if (isGuest) {
                                alert('Los perfiles de invitado son temporales. Regístrate para personalizar tu avatar.')
                            } else {
                                fileInputRef.current?.click()
                            }
                        }}
                        className={`h-40 w-40 rounded-3xl flex items-center justify-center text-zinc-400 dark:text-zinc-500 overflow-hidden border-4 border-transparent transition-all shadow-lg ${!isGuest ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ backgroundColor: 'var(--border)' }}
                    >
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Avatar"
                                className="object-cover w-full h-full"
                                width={160}
                                height={160}
                            />
                        ) : (
                            <User size={64} />
                        )}

                        {!isGuest && (
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="text-white" size={32} />
                            </div>
                        )}

                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="text-white animate-spin" size={32} />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Info & Name Section */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <AnimatePresence mode="wait">
                                {isEditingName ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="text-3xl font-bold bg-transparent border-b-2 outline-none text-zinc-900 dark:text-zinc-50 min-w-[200px]"
                                            style={{ borderColor: 'var(--accent)' }}
                                            autoFocus
                                            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                        />
                                        <button
                                            onClick={handleNameSave}
                                            disabled={isSavingName}
                                            className="p-2 text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                                            style={{ backgroundColor: 'var(--accent)' }}
                                        >
                                            {isSavingName ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingName(false)}
                                            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex items-center gap-4"
                                    >
                                        <h2 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                                            {profile?.full_name || email.split('@')[0]}
                                        </h2>
                                        {!isGuest && (
                                            <button
                                                onClick={() => setIsEditingName(true)}
                                                className="p-2 text-zinc-300 dark:text-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                            >
                                                <Pencil size={24} />
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <p className="text-zinc-500 font-medium">{email}</p>
                    </div>

                    <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-500 shadow-sm border transition-colors duration-500"
                                style={{ backgroundColor: 'var(--border)', borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
                            >
                                Foco Core Nivel 7
                            </div>

                            {/* Gender Segment */}
                            <AnimatePresence mode="wait">
                                {isEditingGender ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-3 p-2 pl-4 rounded-2xl border transition-colors duration-500"
                                        style={{
                                            backgroundColor: 'color-mix(in srgb, var(--surface) 90%, var(--accent))',
                                            borderColor: 'var(--border)'
                                        }}
                                    >
                                        <select
                                            value={tempGender}
                                            onChange={(e) => setTempGender(e.target.value)}
                                            className="bg-transparent text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 outline-none"
                                            autoFocus
                                        >
                                            <option value="">Género</option>
                                            <option value="male">Hombre</option>
                                            <option value="female">Mujer</option>
                                            <option value="other">Otro</option>
                                        </select>
                                        <button
                                            onClick={handleGenderSave}
                                            disabled={isSavingName}
                                            className="p-1.5 text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                                            style={{ backgroundColor: 'var(--accent)' }}
                                        >
                                            {isSavingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingGender(false)}
                                            className="p-1.5 text-zinc-400 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingGender(true)}
                                        className="px-5 py-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-500 shadow-sm border transition-all duration-500 flex items-center gap-2 group"
                                        style={{ backgroundColor: 'var(--border)', borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
                                    >
                                        {profile?.gender ? (
                                            profile.gender === 'male' ? 'Hombre' : profile.gender === 'female' ? 'Mujer' : 'Otro'
                                        ) : (
                                            'Añadir Género'
                                        )}
                                        {!isGuest && <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </button>
                                )}
                            </AnimatePresence>

                            {/* Birth Date Segment */}
                            <AnimatePresence mode="wait">
                                {isEditingBirthDate ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-3 p-2 pl-4 rounded-2xl border transition-colors duration-500"
                                        style={{
                                            backgroundColor: 'color-mix(in srgb, var(--surface) 90%, var(--accent))',
                                            borderColor: 'var(--border)'
                                        }}
                                    >
                                        <input
                                            type="date"
                                            value={tempBirthDate}
                                            onChange={(e) => setTempBirthDate(e.target.value)}
                                            className="bg-transparent text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 outline-none"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleBirthDateSave}
                                            disabled={isSavingName}
                                            className="p-1.5 text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                                            style={{ backgroundColor: 'var(--accent)' }}
                                        >
                                            {isSavingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingBirthDate(false)}
                                            className="p-1.5 text-zinc-400 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingBirthDate(true)}
                                        className="px-5 py-2.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl text-xs font-bold uppercase tracking-wider text-zinc-500 shadow-sm border transition-all duration-500 flex items-center gap-2 group"
                                        style={{ backgroundColor: 'var(--border)', borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
                                    >
                                        {profile?.birth_date ? (
                                            new Date(profile.birth_date).toLocaleDateString()
                                        ) : (
                                            'Añadir Nacimiento'
                                        )}
                                        {!isGuest && <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
