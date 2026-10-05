import { memo, useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

/**
 * Texto con matemáticas bonitas (KaTeX).
 *  - $ ... $   → fórmula en línea      ej: "Calcula $\lim_{x\to 2} \frac{x^2-4}{x-2}$"
 *  - $$ ... $$ → fórmula centrada grande
 * Si un texto no trae $ se muestra tal cual (los ejercicios viejos siguen funcionando).
 */
const RE = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g

function renderTex(tex, displayMode) {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode, strict: 'ignore', output: 'html' })
  } catch {
    return null
  }
}

function MathText({ text, className = '', block = false }) {
  const parts = useMemo(() => {
    const s = String(text ?? '')
    if (!s.includes('$')) return [{ t: 'txt', v: s }]
    return s.split(RE).filter(Boolean).map(seg => {
      if (seg.startsWith('$$') && seg.endsWith('$$') && seg.length > 4) {
        return { t: 'math', v: seg.slice(2, -2), display: true }
      }
      if (seg.startsWith('$') && seg.endsWith('$') && seg.length > 2) {
        return { t: 'math', v: seg.slice(1, -1), display: false }
      }
      return { t: 'txt', v: seg }
    })
  }, [text])

  const Tag = block ? 'div' : 'span'
  return (
    <Tag className={`math-text ${className}`}>
      {parts.map((p, i) => {
        if (p.t === 'txt') return <span key={i}>{p.v}</span>
        const html = renderTex(p.v, p.display)
        if (!html) return <code key={i}>{p.v}</code>
        return p.display
          ? <span key={i} className="math-display" dangerouslySetInnerHTML={{ __html: html }} />
          : <span key={i} className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
      })}
    </Tag>
  )
}

export default memo(MathText)
