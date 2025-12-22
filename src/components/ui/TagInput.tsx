import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Tag } from './Tag'

interface TagInputProps {
    value: string[]
    onChange: (tags: string[]) => void
    suggestions?: string[]
    placeholder?: string
    className?: string
}

export function TagInput({
    value,
    onChange,
    suggestions = [],
    placeholder,
    className,
}: TagInputProps) {
    const { t } = useTranslation()
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)


    const filteredSuggestions = suggestions.filter(
        (s) =>
            s.toLowerCase().includes(inputValue.toLowerCase()) &&
            !value.includes(s)
    )

    const addTag = useCallback(
        (tag: string) => {
            const trimmed = tag.trim()
            if (trimmed && !value.includes(trimmed)) {
                onChange([...value, trimmed])
            }
            setInputValue('')
            setShowSuggestions(false)
            setSelectedIndex(-1)
        },
        [value, onChange]
    )

    const removeTag = useCallback(
        (tagToRemove: string) => {
            onChange(value.filter((t) => t !== tagToRemove))
        },
        [value, onChange]
    )

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (selectedIndex >= 0 && filteredSuggestions[selectedIndex]) {
                addTag(filteredSuggestions[selectedIndex])
            } else if (inputValue.trim()) {
                addTag(inputValue)
            }
        } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
            removeTag(value[value.length - 1])
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((prev) =>
                prev < filteredSuggestions.length - 1 ? prev + 1 : prev
            )
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
            setSelectedIndex(-1)
        }
    }


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div
                className={cn(
                    'input flex flex-wrap items-center gap-1.5 min-h-[42px] py-1.5 px-2 cursor-text',
                    'focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400'
                )}
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag) => (
                    <Tag key={tag} name={tag} onRemove={() => removeTag(tag)} />
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setShowSuggestions(true)
                        setSelectedIndex(-1)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? (placeholder || t('tags.placeholder')) : ''}
                    className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm placeholder:text-slate-400"
                />
            </div>

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className={cn(
                                'w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                                index === selectedIndex && 'bg-slate-100'
                            )}
                        >
                            <Tag name={suggestion} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
