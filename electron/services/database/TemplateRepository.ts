import { app } from 'electron'
import type { Template, TemplateCategory } from '../../../src/types'
import type { DataStore } from './DataStore'

function getDefaultTemplates(locale: string): Array<{ name: string; description: string; content: string; category: TemplateCategory }> {
  if (locale === 'tr') {
    return [
      {
        name: 'Haftalık Sync',
        description: 'Haftalık düzenli 1-1 toplantıları için',
        category: 'general',
        content: '## Bu Hafta Neler Oldu?\n- \n\n## Engelleyiciler & Zorluklar\n- \n\n## Sonraki Hafta Planı\n- \n\n## Notlar\n- ',
      },
      {
        name: 'Performans Görüşmesi',
        description: 'Hedef takibi, geri bildirim ve değerlendirme',
        category: 'manager',
        content: '## Dönem Değerlendirmesi\n- \n\n## Başarılar & Güçlü Yanlar\n- \n\n## Gelişim Alanları\n- \n\n## Hedef Takibi\n- [ ] \n\n## Geri Bildirim\n### Benden Ona\n- \n\n### Ondan Bana\n- ',
      },
      {
        name: 'Kariyer Görüşmesi',
        description: 'Uzun vadeli hedefler ve gelişim planı',
        category: 'manager',
        content: '## Mevcut Durum\n- Rolden memnuniyet: \n- Motivasyon seviyesi: \n\n## Kısa Vadeli Hedefler (3 ay)\n- [ ] \n\n## Uzun Vadeli Hedefler (1 yıl)\n- [ ] \n\n## Gelişim Planı\n- Öğrenilecek beceriler: \n- Deneyim fırsatları: \n\n## Destek İhtiyaçları\n- ',
      },
      {
        name: 'Proje Durumu',
        description: 'Sprint veya proje ilerleme takibi',
        category: 'teammate',
        content: '## Proje İlerlemesi\n- Tamamlanan: \n- Devam eden: \n- Bekleyen: \n\n## Teknik Zorluklar\n- \n\n## Bağımlılıklar & Riskler\n- \n\n## Sonraki Adımlar\n- [ ] ',
      },
      {
        name: 'Beyin Fırtınası',
        description: 'Yaratıcı tartışma ve fikir paylaşımı',
        category: 'teammate',
        content: '## Konu / Problem\n- \n\n## Fikirler\n1. \n2. \n3. \n\n## Artılar & Eksiler\n| Fikir | Artı | Eksi |\n|-------|------|------|\n|  |  |  |\n\n## Karar & Sonraki Adımlar\n- ',
      },
      {
        name: 'İlk Tanışma',
        description: 'Yeni iş ilişkisi başlangıcı',
        category: 'general',
        content: '## Tanışma\n- İsim & Rol: \n- Deneyim: \n\n## Beklentiler\n- Benden beklentileri: \n- Benim beklentilerim: \n\n## Çalışma Tarzı\n- İletişim tercihi: \n- Toplantı sıklığı: \n\n## Notlar\n- ',
      },
    ]
  }
  return [
    {
      name: 'Weekly Sync',
      description: 'For regular weekly 1-1 meetings',
      category: 'general',
      content: '## What Happened This Week?\n- \n\n## Blockers & Challenges\n- \n\n## Next Week Plan\n- \n\n## Notes\n- ',
    },
    {
      name: 'Performance Review',
      description: 'Goal tracking, feedback, and evaluation',
      category: 'manager',
      content: '## Period Review\n- \n\n## Achievements & Strengths\n- \n\n## Areas for Improvement\n- \n\n## Goal Tracking\n- [ ] \n\n## Feedback\n### From Me\n- \n\n### From Them\n- ',
    },
    {
      name: 'Career Growth',
      description: 'Long-term goals and development plan',
      category: 'manager',
      content: '## Current State\n- Role satisfaction: \n- Motivation level: \n\n## Short-term Goals (3 months)\n- [ ] \n\n## Long-term Goals (1 year)\n- [ ] \n\n## Development Plan\n- Skills to learn: \n- Experience opportunities: \n\n## Support Needed\n- ',
    },
    {
      name: 'Project Status',
      description: 'Sprint or project progress tracking',
      category: 'teammate',
      content: '## Project Progress\n- Completed: \n- In progress: \n- Blocked: \n\n## Technical Challenges\n- \n\n## Dependencies & Risks\n- \n\n## Next Steps\n- [ ] ',
    },
    {
      name: 'Brainstorm',
      description: 'Creative discussion and idea sharing',
      category: 'teammate',
      content: '## Topic / Problem\n- \n\n## Ideas\n1. \n2. \n3. \n\n## Pros & Cons\n| Idea | Pro | Con |\n|------|-----|-----|\n|  |  |  |\n\n## Decision & Next Steps\n- ',
    },
    {
      name: 'First Meeting',
      description: 'Starting a new working relationship',
      category: 'general',
      content: '## Introduction\n- Name & Role: \n- Background: \n\n## Expectations\n- Their expectations: \n- My expectations: \n\n## Working Style\n- Communication preference: \n- Meeting frequency: \n\n## Notes\n- ',
    },
  ]
}

export class TemplateRepository {
  constructor(private store: DataStore) {}
  seedDefaults(): void {
    const locale = app.getLocale().startsWith('tr') ? 'tr' : 'en'
    const newDefaults = getDefaultTemplates(locale)
    const existingDefaults = this.store.templates.filter((t) => t.isDefault)
    const needsReseed = existingDefaults.length !== newDefaults.length ||
      existingDefaults.some((t) => !t.category)
    if (needsReseed) {
      this.store.templates = this.store.templates.filter((t) => !t.isDefault)
      for (const template of newDefaults) {
        this.store.templates.push({
          id: this.store.getNextId('templates'),
          ...template,
          isDefault: true,
        })
      }
    }
    this.migrateCategories()
  }
  private migrateCategories(): void {
    for (const template of this.store.templates) {
      if (!template.category) {
        (template as Template).category = 'general'
      }
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
