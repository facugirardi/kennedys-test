"use client"

import React, { useState, useMemo } from 'react'

/**
 * Splits text into sentences (roughly by . ! ?)
 */
function splitSentences(text: string): string[] {
  if (!text || typeof text !== 'string') return []
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

interface TruncateTextProps {
  text: string
  maxSentences?: number
  className?: string
  viewMoreLabel?: string
  viewLessLabel?: string
  /** Cuando está expandido, mostrar en dos párrafos (3.13) */
  twoParagraphsWhenExpanded?: boolean
}

function splitIntoTwoParagraphs(sentences: string[]): [string, string] {
  if (sentences.length <= 1) return [sentences.join(' '), '']
  const mid = Math.ceil(sentences.length / 2)
  return [
    sentences.slice(0, mid).join(' '),
    sentences.slice(mid).join(' '),
  ]
}

export function TruncateText({
  text,
  maxSentences = 5,
  className = '',
  viewMoreLabel = 'View more',
  viewLessLabel = 'View less',
  twoParagraphsWhenExpanded = false,
}: TruncateTextProps) {
  const [expanded, setExpanded] = useState(false)
  const sentences = useMemo(() => splitSentences(text), [text])
  const shouldTruncate = sentences.length > maxSentences
  const visibleSentences = expanded ? sentences : sentences.slice(0, maxSentences)
  const displayText = visibleSentences.join(' ')

  if (!text) return null
  if (!shouldTruncate) {
    if (twoParagraphsWhenExpanded && sentences.length > 2) {
      const [p1, p2] = splitIntoTwoParagraphs(sentences)
      return (
        <span className={className}>
          <span>{p1}</span>
          {p2 && <><br /><br /><span>{p2}</span></>}
        </span>
      )
    }
    return <span className={className}>{text}</span>
  }

  if (expanded && twoParagraphsWhenExpanded) {
    const [p1, p2] = splitIntoTwoParagraphs(visibleSentences)
    return (
      <span className={className}>
        <span>{p1}</span>
        {p2 && <><br /><br /><span>{p2}</span></>}
        {' '}
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="underline font-medium hover:no-underline ml-1 text-inherit"
        >
          {viewLessLabel}
        </button>
      </span>
    )
  }

  return (
    <span className={className}>
      {displayText}
      {!expanded && ' '}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="underline font-medium hover:no-underline ml-1 text-inherit"
      >
        {expanded ? viewLessLabel : viewMoreLabel}
      </button>
    </span>
  )
}

export default TruncateText
