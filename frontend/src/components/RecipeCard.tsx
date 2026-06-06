/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Utensils, ArrowRight } from 'lucide-react';
import { Recipe, Comment } from '../types';
import { api } from '../api/client';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';

interface RecipeCardProps {
  recipe: Recipe;
  showAdminControls?: boolean;
  onEditClick?: (recipeId: string, e: React.MouseEvent) => void;
  onDeleteClick?: (recipeId: string, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  showAdminControls = false,
  onEditClick,
  onDeleteClick,
}) => {
  const navigate = useNavigate();
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [imgError, setImgError] = useState(false);

  // Fetch comments to calculate average rating client-side as specified
  useEffect(() => {
    let mounted = true;
    const fetchComments = async () => {
      try {
        const res = await api.get(`/api/recipes/${recipe._id}/comments`);
        const comments: Comment[] = res.data;
        if (mounted) {
          if (comments && comments.length > 0) {
            const sum = comments.reduce((acc, c) => acc + c.rating, 0);
            setAvgRating(sum / comments.length);
            setCommentsCount(comments.length);
          } else {
            setAvgRating(null);
            setCommentsCount(0);
          }
        }
      } catch (err) {
        console.error(`Failed to fetch comments for recipe ${recipe._id}`, err);
      }
    };

    fetchComments();
    return () => {
      mounted = false;
    };
  }, [recipe._id]);

  // Generates a consistent aesthetic color based on the title string
  const getPlaceholderBg = (title: string) => {
    const palette = [
      'bg-[#c0392b] text-white',
      'bg-[#2c3e50] text-white',
      'bg-[#16a085] text-white',
      'bg-[#d35400] text-white',
      'bg-[#27ae60] text-white',
      'bg-[#8e44ad] text-white',
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palette.length;
    return palette[index];
  };

  const handleCardClick = () => {
    navigate(`/recipes/${recipe._id}`);
  };

  const firstLetter = recipe.title ? recipe.title.charAt(0).toUpperCase() : 'R';

  const difficultyBadgeClass = (() => {
    const base = 'font-mono text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5';
    switch (recipe.difficulty) {
      case 'Easy':
        return `bg-[#27ae60] text-white ${base}`;
      case 'Medium':
        return `bg-star text-white ${base}`;
      case 'Hard':
        return `bg-[#c0392b] text-white ${base}`;
      default:
        return `bg-border-custom text-text-muted ${base}`;
    }
  })();

  return (
    <div
      onClick={handleCardClick}
      className="group relative border border-border-custom bg-surface cursor-pointer flex flex-col justify-between transition-all duration-300 hover:border-text-custom hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)] -translate-y-0 hover:-translate-y-1"
      id={`recipe-card-${recipe._id}`}
    >
      {/* Recipe image / placeholder */}
      <div className="relative w-full aspect-[16/9] overflow-hidden border-b border-border-custom bg-[#f0ede6]">
        {recipe.imageUrl && !imgError ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center font-serif text-5xl font-bold tracking-tight ${getPlaceholderBg(recipe.title)}`}>
            {firstLetter}
          </div>
        )}

        {/* Floating admin tools on hover for profile view if owned */}
        {showAdminControls && (
          <div className="absolute top-3 right-3 flex gap-2 z-10 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEditClick) onEditClick(recipe._id, e);
              }}
              className="bg-surface text-text-custom border border-border-custom p-2 hover:bg-text-custom hover:text-surface transition-colors cursor-pointer shadow-sm"
              title="Edit Recipe"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M12 20h9"/><path d="M16.5 3.5l4 4L7 21l-4 1 1-4Z"/></svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDeleteClick) onDeleteClick(recipe._id, e);
              }}
              className="bg-surface text-danger border border-border-custom p-2 hover:bg-danger hover:text-white transition-colors cursor-pointer shadow-sm"
              title="Delete Recipe"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Metadata row */}
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider uppercase text-text-muted mb-2">
            <span>{recipe.category}</span>
            <Badge className={difficultyBadgeClass}>{recipe.difficulty}</Badge>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl font-bold text-text-custom leading-snug tracking-tight mb-2 group-hover:text-[#c0392b] transition-colors line-clamp-1">
            {recipe.title}
          </h3>
        </div>

        <div>
          {/* Flat characteristics row */}
          <div className="flex items-center gap-4 text-xs text-text-muted mb-4 font-mono font-medium">
            <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-1 border border-border-custom/50">
              <Clock size={12} className="text-text-custom" />
              <span>{recipe.time} min</span>
            </span>
            <span className="flex items-center gap-1.5 bg-neutral-100 px-2 py-1 border border-border-custom/50">
              <Utensils size={12} className="text-text-custom" />
              <span>{recipe.servings} pp</span>
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border-custom my-3"></div>

          {/* Star rating row */}
          <div className="flex items-center justify-between mt-3 pt-1 h-5">
            {avgRating !== null ? (
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} size="sm" />
                <span className="text-[11px] font-mono text-text-muted mt-0.5 font-bold">
                  ({commentsCount})
                </span>
              </div>
            ) : (
              <span className="text-[11px] font-mono text-text-muted italic">No reviews yet</span>
            )}

            {/* Link prompt indicator */}
            <span className="text-[11px] uppercase tracking-wider font-mono text-text-custom font-bold group-hover:text-[#c0392b] transition-colors flex items-center gap-1.5 border-b border-transparent group-hover:border-[#c0392b] pb-0.5">
              <span>View</span>
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
