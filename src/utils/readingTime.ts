/**
 * Reading time calculation utility for editorial articles and essays.
 * Standard adult reading speed: ~200 - 220 words per minute.
 */

export interface ReadingTimeResult {
  minutes: number;
  text: string;
  wordCount: number;
}

export function calculateReadingTime(content: string = '', excerpt: string = ''): ReadingTimeResult {
  // Combine content and excerpt, strip markdown characters and extra whitespace
  const combined = `${content} ${excerpt}`
    .replace(/[#*`_~[\]()<>!-]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  const words = combined ? combined.split(/\s+/).filter(Boolean).length : 0;
  const wordsPerMinute = 200;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  return {
    minutes,
    text: `${minutes} min read`,
    wordCount: words,
  };
}
