"use client";

import React, { useState } from "react";
import Image from "next/image";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export const StarRating = ({ value = 0, onChange, max = 5 }: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  
  const handleMouseOver = (index: number) => {
    setHoverValue(index);
  };
  
  const handleMouseLeave = () => {
    setHoverValue(null);
  };
  
  const handleClick = (index: number) => {
    onChange(index);
  };
  
  return (
    <div className="flex gap-2">
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isActive = (hoverValue !== null ? starValue <= hoverValue : starValue <= value);
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseOver={() => handleMouseOver(starValue)}
            onMouseLeave={handleMouseLeave}
            className="p-0 bg-transparent border-none cursor-pointer focus:outline-none transition-transform hover:scale-110"
          >
            <img
              src={isActive ? "/assets/icons/star.svg" : "/assets/icons/star-empty.svg"}
              alt={`Star ${starValue}`}
              width={32}
              height={32}
              className="transition-all text-soft-gray"
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
