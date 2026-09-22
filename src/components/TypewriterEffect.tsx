import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  prefix?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  words,
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseDuration = 2200,
  className = "",
  prefix = ""
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullWord = words[currentWordIndex % words.length];

    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        if (currentText.length + 1 === fullWord.length) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        // Deleting
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        if (currentText.length - 1 === 0) {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center font-mono ${className}`}>
      {prefix && <span className="text-[#C59B63]/80 mr-2">{prefix}</span>}
      <span className="text-[#C59B63]">{currentText}</span>
      <span className="w-0.5 h-4 ml-1 bg-[#C59B63] inline-block opacity-90" />
    </span>
  );
};
