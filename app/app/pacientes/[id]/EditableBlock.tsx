'use client'

import { useState, useRef } from 'react'
import { updatePatientField } from '../actions'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Edit2, Loader2 } from 'lucide-react'

interface EditableBlockProps {
  title: string
  field: string
  initialValue: string | null
  patientId: string
  isLongText?: boolean
  isAlert?: boolean
  placeholder?: string
  readOnly?: boolean
}

export function EditableBlock({ 
  title, 
  field, 
  initialValue, 
  patientId, 
  isLongText = false,
  isAlert = false,
  placeholder = "Sem registro ainda — clique para adicionar",
  readOnly = false
}: EditableBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleEdit = () => {
    if (readOnly) return
    setIsEditing(true)
    setIsSaved(false)
    // Focus after render
    setTimeout(() => {
      if (isLongText && textareaRef.current) {
        textareaRef.current.focus()
        // Move cursor to end
        textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
      } else if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 50)
  }

  const handleSave = async () => {
    if (value === (initialValue || '')) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await updatePatientField(patientId, field, value)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save field', error)
      // Revert on error
      setValue(initialValue || '')
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setValue(initialValue || '')
      setIsEditing(false)
    }
    if (!isLongText && e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <div 
      className={`
        relative flex flex-col h-full min-h-[140px] panel
        transition-colors
        ${isAlert ? 'bg-[#fffbeb] border-[#fde68a]' : ''}
        ${!isEditing && !readOnly ? 'hover:border-primary/25 cursor-text group' : ''}
        ${isEditing ? 'ring-2 ring-primary/15 border-primary/30' : ''}
      `}
      onClick={!isEditing && !readOnly ? handleEdit : undefined}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-medium ${isAlert ? 'text-amber-800' : 'text-muted-foreground'}`}>
          {title}
        </h3>
        
        <div className="flex items-center h-5">
          {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          {isSaved && <Check className="h-3.5 w-3.5 text-green-500" />}
          {!isEditing && !isSaving && !isSaved && !readOnly && (
            <Edit2 className="h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors" />
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {isEditing ? (
          <div className="flex-1 flex flex-col gap-3">
            {isLongText ? (
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 text-base md:text-sm bg-transparent"
                placeholder={placeholder}
              />
            ) : (
              <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="border-0 p-0 h-auto focus-visible:ring-0 text-base md:text-sm bg-transparent font-medium"
                placeholder={placeholder}
              />
            )}
            <div className="flex justify-end">
              <Button size="sm" variant="secondary" onMouseDown={(e) => { e.preventDefault(); handleSave(); }}>
                Salvar
              </Button>
            </div>
          </div>
        ) : (
          <div className={`flex-1 whitespace-pre-wrap leading-relaxed ${!value ? 'text-muted-foreground/60 italic text-sm' : 'text-[15px] text-foreground/90'}`}>
            {value || placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
