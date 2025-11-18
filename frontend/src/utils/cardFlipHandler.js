/**
 * Card Flip Handler Utility
 * Provides functionality for 3D flip cards with details
 */

import { useState, useEffect } from 'react';

/**
 * Initialize flip card functionality for cards with details
 * @param {string} cardSelector - CSS selector for cards (e.g., '.achievement-card')
 * @param {function} hasDetailsCallback - Function that returns true if card has details to show
 * @param {function} getDetailsCallback - Function that returns the details content for the card
 */
export function initializeFlipCards(cardSelector, hasDetailsCallback, getDetailsCallback) {
  const cards = document.querySelectorAll(cardSelector);
  
  cards.forEach((card, index) => {
    // Check if card has details
    const hasDetails = hasDetailsCallback(card, index);
    
    if (!hasDetails) {
      return; // Skip cards without details
    }
    
    // Add clickable class for styling
    card.classList.add('clickable');
    
    // Wrap card content in flip container if not already wrapped
    if (!card.querySelector('.card-flip-container')) {
      const originalContent = card.innerHTML;
      const details = getDetailsCallback(card, index);
      
      card.innerHTML = `
        <div class="card-flip-container">
          <div class="card-inner">
            <div class="card-front">
              ${originalContent}
            </div>
            <div class="card-back">
              <div class="card-back-header">
                <h3 class="card-back-title">${details.title || 'Details'}</h3>
                <button class="card-close-btn" aria-label="Close details">✕</button>
              </div>
              <div class="card-back-content">
                ${details.content || '<p>No additional details available.</p>'}
              </div>
              ${details.tags ? `
                <div class="card-back-meta">
                  ${details.tags.map(tag => `<span class="card-meta-tag">${tag}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }
    
    // Add click event listener
    const flipContainer = card.querySelector('.card-flip-container');
    const closeBtn = card.querySelector('.card-close-btn');
    
    if (flipContainer) {
      // Click on card to flip
      card.addEventListener('click', (e) => {
        // Don't flip if clicking on links or buttons
        if (e.target.closest('a, button:not(.card-close-btn)')) {
          return;
        }
        
        flipContainer.classList.toggle('flipped');
      });
      
      // Close button to flip back
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          flipContainer.classList.remove('flipped');
        });
      }
      
      // Escape key to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && flipContainer.classList.contains('flipped')) {
          flipContainer.classList.remove('flipped');
        }
      });
    }
  });
}

/**
 * Example usage for achievements:
 * 
 * initializeFlipCards(
 *   '.achievement-card',
 *   (card, index) => {
 *     // Check if card has detailed description
 *     const description = card.dataset.details;
 *     return description && description.length > 100;
 *   },
 *   (card, index) => {
 *     return {
 *       title: card.querySelector('h3')?.textContent || 'Achievement Details',
 *       content: card.dataset.details || card.dataset.description,
 *       tags: card.dataset.tags ? card.dataset.tags.split(',') : []
 *     };
 *   }
 * );
 */

/**
 * Simple flip card toggle for already structured cards
 * @param {Event} event - Click event
 */
export function toggleCardFlip(event) {
  const card = event.currentTarget;
  const flipContainer = card.querySelector('.card-flip-container');
  
  if (flipContainer) {
    // Don't flip if clicking on links or buttons (except close)
    if (event.target.closest('a, button:not(.card-close-btn)')) {
      return;
    }
    
    flipContainer.classList.toggle('flipped');
  }
}

/**
 * Close flip card
 * @param {Event} event - Click event
 */
export function closeCardFlip(event) {
  event.stopPropagation();
  const card = event.currentTarget.closest('.achievement-card, .service-card, .project-card, .education-card, .blog-card');
  const flipContainer = card?.querySelector('.card-flip-container');
  
  if (flipContainer) {
    flipContainer.classList.remove('flipped');
  }
}

/**
 * Add keyboard support for flippable cards
 */
export function initializeCardKeyboardSupport() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close all flipped cards
      const flippedCards = document.querySelectorAll('.card-flip-container.flipped');
      flippedCards.forEach(card => {
        card.classList.remove('flipped');
      });
    }
  });
}

/**
 * React Hook version for flip cards
 */
export function useCardFlip() {
  const [flipped, setFlipped] = useState(false);
  
  const toggleFlip = (e) => {
    // Don't flip if clicking on links or buttons (except close)
    if (e?.target?.closest('a, button:not(.card-close-btn)')) {
      return;
    }
    setFlipped(prev => !prev);
  };
  
  const closeFlip = (e) => {
    e?.stopPropagation();
    setFlipped(false);
  };
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && flipped) {
        setFlipped(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [flipped]);
  
  return { flipped, toggleFlip, closeFlip };
}
