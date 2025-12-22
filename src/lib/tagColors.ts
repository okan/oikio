


const TAG_COLORS = [
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
]


function hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash 
    }
    return Math.abs(hash)
}


export function getTagColor(tagName: string): {
    bg: string
    text: string
    border: string
} {
    const hash = hashString(tagName.toLowerCase().trim())
    const index = hash % TAG_COLORS.length
    return TAG_COLORS[index]
}


export function getTagClasses(tagName: string): string {
    const color = getTagColor(tagName)
    return `${color.bg} ${color.text} ${color.border}`
}
