import type { Template } from '../../../src/types'
import type { DataStore } from './DataStore'
const DEFAULT_TEMPLATES = [
  {
    name: 'Haftalık Sync',
    description: 'Haftalık düzenli 1-1 toplantıları için',
    content: '## Bu Hafta\n- \n\n## Engelleyiciler\n- \n\n## Sonraki Hafta\n- ',
  },
  {
    name: 'Performans Görüşmesi',
    description: 'Performans değerlendirme toplantıları için',
    content:
      '## Başarılar\n- \n\n## Gelişim Alanları\n- \n\n## Hedefler\n- \n\n## Geri Bildirim\n- ',
  },
  {
    name: 'Kariyer Görüşmesi',
    description: 'Kariyer gelişimi ve hedefler için',
    content:
      '## Kısa Vadeli Hedefler\n- \n\n## Uzun Vadeli Hedefler\n- \n\n## Gelişim Planı\n- \n\n## Destek İhtiyaçları\n- ',
  },
]
export class TemplateRepository {
  constructor(private store: DataStore) {}
  seedDefaults(): void {
    const hasDefaultTemplates = this.store.templates.some((t) => t.isDefault)
    if (!hasDefaultTemplates) {
      for (const template of DEFAULT_TEMPLATES) {
        this.store.templates.push({
          id: this.store.getNextId('templates'),
          ...template,
          isDefault: true,
        })
      }
      this.store.save()
    }
  }
  getAll(): Template[] {
    return [...this.store.templates].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return a.name.localeCompare(b.name)
    })
  }
  getById(id: number): Template | null {
    return this.store.templates.find((t) => t.id === id) || null
  }
  create(data: Omit<Template, 'id'>): Template {
    const template: Template = {
      id: this.store.getNextId('templates'),
      ...data,
    }
    this.store.templates.push(template)
    this.store.save()
    return template
  }
  update(id: number, data: Partial<Template>): Template {
    const index = this.store.templates.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Template not found')
    this.store.templates[index] = { ...this.store.templates[index], ...data }
    this.store.save()
    return this.store.templates[index]
  }
  delete(id: number): void {
    this.store.templates = this.store.templates.filter((t) => t.id !== id)
    this.store.save()
  }
  getDefaults(): Template[] {
    return this.store.templates.filter((t) => t.isDefault)
  }
}
