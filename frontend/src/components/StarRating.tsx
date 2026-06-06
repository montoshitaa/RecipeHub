/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StarRatingProps {
  rating: number; // 0 to 5
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 'md',
}) => {
  const starsArray = [1, 2, 3, 4, 5];
  const roundedRating = Math.round(rating);

  const sizeClasses = {
    sm: 'text-sm gap-0.5',
    md: 'text-[15px] gap-1',
    lg: 'text-2xl gap-1.5',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {starsArray.map((num) => {
        const isFilled = num <= roundedRating;
        return (
          <button
            key={num}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(num)}
            className={`transition-colors ${
              interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'
            } ${isFilled ? 'text-star' : 'text-border-custom'}`}
            title={interactive ? `Rate ${num} Stars` : `${rating} out of 5 stars`}
          >
            {isFilled ? '★' : '☆'}
          </button>
        );
      })}
    </div>
  );
};
