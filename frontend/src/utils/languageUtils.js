/**
 * Utility functions for handling language-specific content
 */

/**
 * Get the appropriate content based on language
 * @param {Object} item - The data item with translations
 * @param {String} language - The current language (en, hi, es)
 * @param {String} field - The field to get (title, description, etc.)
 * @returns {String} - The translated content or fallback to English
 */
export const getLocalizedContent = (item, language, field) => {
  if (!item) return '';
  
  // First check if there are translations
  if (item.translations && item.translations[language] && item.translations[language][field]) {
    return item.translations[language][field];
  }
  
  // Fallback to default language (English) translation
  if (item.translations && item.translations.en && item.translations.en[field]) {
    return item.translations.en[field];
  }
  
  // Final fallback to the base field
  return item[field] || '';
};

/**
 * Get language-specific media URL
 * @param {Object} item - The data item with languageMedia
 * @param {String} language - The current language (en, hi, es)
 * @param {String} mediaType - Type of media (imageUrl, videoUrl, thumbnailUrl)
 * @returns {String} - The media URL or fallback
 */
export const getLocalizedMedia = (item, language, mediaType = 'imageUrl') => {
  if (!item) return '';
  
  // Check for language-specific media
  if (item.languageMedia && item.languageMedia[language]) {
    const media = item.languageMedia[language];
    
    // For vlogs, check nested structure
    if (typeof media === 'object' && media[mediaType]) {
      return media[mediaType];
    }
    
    // For gallery, languageMedia might be direct URL
    if (typeof media === 'string' && mediaType === 'imageUrl') {
      return media;
    }
  }
  
  // Fallback to English media
  if (item.languageMedia && item.languageMedia.en) {
    const media = item.languageMedia.en;
    if (typeof media === 'object' && media[mediaType]) {
      return media[mediaType];
    }
    if (typeof media === 'string' && mediaType === 'imageUrl') {
      return media;
    }
  }
  
  // Final fallback to base media field
  return item[mediaType] || item.imageUrl || item.videoUrl || '';
};

/**
 * Check if content is available in the specified language
 * @param {Object} item - The data item
 * @param {String} language - The language to check
 * @returns {Boolean}
 */
export const hasLanguageContent = (item, language) => {
  if (!item) return false;
  
  const hasTranslation = item.translations && 
                        item.translations[language] && 
                        (item.translations[language].title || item.translations[language].description);
  
  const hasMedia = item.languageMedia && item.languageMedia[language];
  
  return hasTranslation || hasMedia;
};

/**
 * Get all available languages for an item
 * @param {Object} item - The data item
 * @returns {Array} - Array of language codes
 */
export const getAvailableLanguages = (item) => {
  if (!item) return ['en'];
  
  const languages = new Set(['en']); // English is always default
  
  if (item.translations) {
    Object.keys(item.translations).forEach(lang => {
      if (item.translations[lang].title || item.translations[lang].description) {
        languages.add(lang);
      }
    });
  }
  
  if (item.languageMedia) {
    Object.keys(item.languageMedia).forEach(lang => {
      if (item.languageMedia[lang]) {
        languages.add(lang);
      }
    });
  }
  
  return Array.from(languages);
};
