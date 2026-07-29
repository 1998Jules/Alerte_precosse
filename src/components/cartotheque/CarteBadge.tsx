'use client'

import { Badge } from '@/components/ui/badge'
import { Check, Lock, Banknote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/app/contexts/LanguageContext'

interface CarteBadgeProps {
  isPayant: boolean
  prixFormate?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Si true, affiche aussi le prix à côté du badge (mode détaillé). */
  withPrice?: boolean
}

/**
 * Badge "Gratuit" / "Payant" posé sur chaque image ou PDF de la cartothèque.
 *
 * - Gratuit : vert (Check)
 * - Payant  : orange/ambre (Lock + Banknote)
 *
 * Le badge est volontairement contrasté pour rester lisible quelle que
 * soit l'image de fond. Il est utilisé à la fois sur la vignette de la
 * carte (overlay) et dans le modal de détail.
 */
export function CarteBadge({
  isPayant,
  prixFormate,
  className,
  size = 'md',
  withPrice = false,
}: CarteBadgeProps) {
  const { t } = useLanguage()

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-0.5',
    md: 'text-xs px-2.5 py-1 gap-1',
    lg: 'text-sm px-3 py-1.5 gap-1.5',
  } as const
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12

  if (isPayant) {
    return (
      <Badge
        className={cn(
          'bg-amber-500 text-white hover:bg-amber-600 border-amber-600 shadow-md font-semibold whitespace-nowrap',
          sizes[size],
          className
        )}
        title={prixFormate ? `${t('cartotheque.badge.paid')} — ${prixFormate}` : t('cartotheque.badge.paid')}
      >
        <Lock size={iconSize} className="shrink-0" />
        <span>{t('cartotheque.badge.paid').toUpperCase()}</span>
        {withPrice && prixFormate && (
          <span className="ml-1 inline-flex items-center gap-1 border-l border-white/40 pl-1.5">
            <Banknote size={iconSize} />
            {prixFormate}
          </span>
        )}
      </Badge>
    )
  }

  return (
    <Badge
      className={cn(
        'bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-600 shadow-md font-semibold whitespace-nowrap',
        sizes[size],
        className
      )}
      title={t('cartotheque.badge.free')}
    >
      <Check size={iconSize} className="shrink-0" />
      <span>{t('cartotheque.badge.free').toUpperCase()}</span>
    </Badge>
  )
}
