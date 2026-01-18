import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Modal } from '@/components/ui'
import { Lock } from 'lucide-react'
export interface Badge {
    id: string
    nameKey: string
    descriptionKey: string
    icon: string
    earned: boolean
}
interface BadgesModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    badges: Badge[]
}
export function BadgesModal({ open, onOpenChange, badges }: BadgesModalProps) {
    const { t } = useTranslation()
    const earnedBadges = badges.filter((b) => b.earned)
    const lockedBadges = badges.filter((b) => !b.earned)
    return (
        <Modal
            open={open}
            onOpenChange={onOpenChange}
            title={t('streak.badgesTitle')}
            description={t('streak.badgesDesc')}
        >
            <div className="space-y-6">
                {earnedBadges.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                            {t('streak.earned')} <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{earnedBadges.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {earnedBadges.map((badge) => (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 border border-amber-100 bg-amber-50/50 rounded-xl flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-xl shadow-sm border border-amber-100">
                                        {badge.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">{t(`streak.${badge.nameKey}`)}</h4>
                                        <p className="text-xs text-slate-600">{t(`streak.${badge.descriptionKey}`)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
                {lockedBadges.length > 0 && (
                    <div className={earnedBadges.length > 0 ? "pt-4 border-t border-slate-100" : ""}>
                        <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                            {t('streak.locked')} <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{lockedBadges.length}</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {lockedBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex items-center gap-3 opacity-70 grayscale"
                                >
                                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-slate-300 border border-slate-100 relative">
                                        {badge.icon}
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-lg">
                                            <Lock className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-700">{t(`streak.${badge.nameKey}`)}</h4>
                                        <p className="text-xs text-slate-500">{t(`streak.${badge.descriptionKey}`)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}
