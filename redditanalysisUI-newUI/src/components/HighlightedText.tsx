import React from 'react';

interface HighlightedTextProps {
  text: string;
  keywords: string[];
}

export function HighlightedText({ text, keywords }: HighlightedTextProps) {
  if (!text || !keywords.length) return <>{text}</>;

  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = keywords.some(keyword => 
          part.toLowerCase() === keyword.toLowerCase()
        );
        
        return isMatch ? (
          <span key={i} className="bg-yellow-200 rounded px-0.5">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
