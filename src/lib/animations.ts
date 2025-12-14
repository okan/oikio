import type { Variants, Transition } from 'framer-motion'
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}
export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}
export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
}
export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
}
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}
export const scaleInUp: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
}
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}
export const staggerContainerSlow: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}
export const staggerContainerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}
export const listItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}
export const listItemHorizontal: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
}
export const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
}
export const cardTap = {
  scale: 0.98,
}
export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}
export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
}
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}
export const smoothTransition: Transition = {
  duration: 0.2,
  ease: 'easeOut',
}
export const fastTransition: Transition = {
  duration: 0.15,
  ease: 'easeOut',
}
export const slowTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}
export const fadeInUpProps = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: fadeInUp,
  transition: smoothTransition,
}
export const staggerContainerProps = {
  initial: 'initial',
  animate: 'animate',
  variants: staggerContainer,
}
export const listItemProps = {
  variants: listItem,
  transition: smoothTransition,
}
export const cardProps = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: fadeInUp,
  whileHover: cardHover,
  whileTap: cardTap,
  transition: smoothTransition,
}
