import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Template } from '@/types'
import { Button, Input, Textarea, Modal } from '@/components/ui'

interface TemplateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: Template | null
  onSubmit: (data: Omit<Template, 'id'>) => Promise<void>
}

export function TemplateForm({ open, onOpenChange, template, onSubmit }: TemplateFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || '')
      setContent(template.content)
    } else {
      setName('')
      setDescription('')
      setContent('## Topic 1\n- \n\n## Topic 2\n- ')
    }
    setErrors({})
  }, [template, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = t('templates.templateName') + ' required'
    }

    if (!content.trim()) {
      newErrors.content = t('templates.content') + ' required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
        isDefault: false,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving template:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={template ? t('templates.editTemplate') : t('templates.addTemplate')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('templates.templateName')}
          placeholder={t('templates.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Input
          label={t('templates.templateDescription')}
          placeholder={t('templates.descPlaceholder')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Textarea
          label={t('templates.content')}
          placeholder={t('templates.contentPlaceholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          rows={10}
          className="font-mono text-sm"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {template ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
