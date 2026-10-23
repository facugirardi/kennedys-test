"use client"

import React, { useMemo } from 'react'

/**
 * Splits text into sentences
 */
function splitSentences(text: string): string[] {
  if (!text || typeof text !== 'string') return []
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Splits long text into two paragraphs at a sentence boundary.
 * Used when the text is long enough to warrant two paragraphs.
 */
function splitIntoTwoParagraphs(text: string): [string, string] {
  const sentences = splitSentences(text)
  if (sentences.length <= 1) return [text, '']
  const mid = Math.ceil(sentences.length / 2)
  return [
    sentences.slice(0, mid).join(' '),
    sentences.slice(mid).join(' '),
  ]
}

interface TwoParagraphTextProps {
  text: string
  maxLengthForSingle?: number
  className?: string
  paragraphClassName?: string
}

const DEFAULT_MAX_LENGTH = 280

export function TwoParagraphText({
  text,
  maxLengthForSingle = DEFAULT_MAX_LENGTH,
  className = '',
  paragraphClassName = '',
}: TwoParagraphTextProps) {
  const [p1, p2] = useMemo(() => {
    if (!text || typeof text !== 'string') return ['', '']
    const trimmed = text.trim()
    if (trimmed.length <= maxLengthForSingle) return [trimmed, '']
    return splitIntoTwoParagraphs(trimmed)
  }, [text, maxLengthForSingle])

  if (!p1 && !p2) return null

  return (
    <div className={className}>
      {p1 && <p className={paragraphClassName}>{p1}</p>}
      {p2 && <p className={paragraphClassName}>{p2}</p>}
    </div>
  )
}

export default TwoParagraphText
