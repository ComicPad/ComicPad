import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Full Page Loading Overlay
 * Use when the entire page needs to show loading state
 */
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-dark-900/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-50 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin relative" />
        </div>
        <h2 className="text-2xl font-bangers text-yellow-400 uppercase tracking-wider">
          {message}
        </h2>
        <div className="flex gap-2 justify-center mt-4">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Section Loading Spinner
 * Use for loading states within a section or card
 */
export const SectionLoader = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
      <p className="text-gray-400 font-semibold">{message}</p>
    </div>
  );
};

/**
 * Inline Loading Spinner
 * Use for small inline loading indicators
 */
export const InlineLoader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`${sizes[size]} text-yellow-400 animate-spin ${className}`} />
  );
};

/**
 * Button Loading State
 * Use inside buttons during async operations
 */
export const ButtonLoader = ({ children, isLoading, loadingText = 'Loading...' }) => {
  return (
    <>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </>
  );
};

/**
 * Skeleton Loader for Cards
 * Use as placeholder while content is loading
 */
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-dark-800 border-2 border-dark-700 rounded-lg p-4 animate-pulse"
        >
          <div className="aspect-[3/4] bg-dark-700 rounded-lg mb-4"></div>
          <div className="h-6 bg-dark-700 rounded mb-2"></div>
          <div className="h-4 bg-dark-700 rounded w-2/3 mb-4"></div>
          <div className="flex justify-between">
            <div className="h-8 bg-dark-700 rounded w-1/3"></div>
            <div className="h-8 bg-dark-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </>
  );
};

/**
 * List Skeleton Loader
 * Use for loading lists of items
 */
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-dark-800 border-2 border-dark-700 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-dark-700 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-dark-700 rounded w-3/4"></div>
              <div className="h-4 bg-dark-700 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-dark-700 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Text Skeleton Loader
 * Use for loading text content
 */
export const TextSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-dark-700 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  );
};

/**
 * Comic Loading Animation
 * Fun comic-themed loading animation
 */
export const ComicLoader = ({ message = 'Loading awesome content...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-8">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 animate-pulse"></div>

        {/* Main loader */}
        <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,215,0,0.5)] animate-spin">
          <div className="w-28 h-28 bg-dark-900 rounded-full flex items-center justify-center">
            <span className="text-5xl animate-bounce">⚡</span>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bangers text-yellow-400 uppercase tracking-wider mb-2">
        {message}
      </h3>

      <div className="flex gap-3 mt-4">
        <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></div>
        <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
      </div>
    </div>
  );
};

/**
 * Progress Bar Loader
 * Use for operations with progress tracking
 */
export const ProgressLoader = ({ progress = 0, message = 'Processing...' }) => {
  return (
    <div className="w-full max-w-md mx-auto py-8">
      <h3 className="text-lg font-bold text-white mb-4 text-center">{message}</h3>
      <div className="relative w-full h-4 bg-dark-700 rounded-full overflow-hidden border-2 border-dark-600">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      <p className="text-center text-yellow-400 font-bold mt-2">{Math.round(progress)}%</p>
    </div>
  );
};

/**
 * Loading Dots Animation
 * Simple loading dots
 */
export const LoadingDots = ({ className = '' }) => {
  return (
    <div className={`flex gap-1 ${className}`}>
      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
      <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
    </div>
  );
};

export default {
  PageLoader,
  SectionLoader,
  InlineLoader,
  ButtonLoader,
  CardSkeleton,
  ListSkeleton,
  TextSkeleton,
  ComicLoader,
  ProgressLoader,
  LoadingDots
};
