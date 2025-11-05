/**
 * Validation schemas for all collections
 */

export const validateProfile = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
    errors.push('Invalid phone format');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateSkill = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Skill name is required');
  }
  
  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required');
  }
  
  if (data.level && !['beginner', 'intermediate', 'advanced', 'expert'].includes(data.level)) {
    errors.push('Level must be: beginner, intermediate, advanced, or expert');
  }
  
  if (data.percentage !== undefined && (isNaN(data.percentage) || data.percentage < 0 || data.percentage > 100)) {
    errors.push('Percentage must be between 0 and 100');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateProject = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Project title is required');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  }
  
  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }
  
  if (data.technologies && !Array.isArray(data.technologies)) {
    errors.push('Technologies must be an array');
  }
  
  if (data.link && !/^https?:\/\/.+/.test(data.link)) {
    errors.push('Link must be a valid URL');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateExperience = (data) => {
  const errors = [];
  
  if (!data.company || typeof data.company !== 'string' || data.company.trim().length === 0) {
    errors.push('Company name is required');
  }
  
  if (!data.position || typeof data.position !== 'string') {
    errors.push('Position is required');
  }
  
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  
  if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
    errors.push('End date must be after start date');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateEducation = (data) => {
  const errors = [];
  
  if (!data.institution || typeof data.institution !== 'string' || data.institution.trim().length === 0) {
    errors.push('Institution name is required');
  }
  
  if (!data.degree || typeof data.degree !== 'string') {
    errors.push('Degree is required');
  }
  
  if (!data.startDate) {
    errors.push('Start date is required');
  }
  
  if (data.endDate && data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
    errors.push('End date must be after start date');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateBlog = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Blog title is required');
  }
  
  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }
  
  if (data.published !== undefined && typeof data.published !== 'boolean') {
    errors.push('Published must be a boolean');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateVlog = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Vlog title is required');
  }
  
  if (!data.videoUrl || !/^https?:\/\/.+/.test(data.videoUrl)) {
    errors.push('Valid video URL is required');
  }
  
  if (data.published !== undefined && typeof data.published !== 'boolean') {
    errors.push('Published must be a boolean');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateGallery = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!data.imageUrl || !/^https?:\/\/.+/.test(data.imageUrl)) {
    errors.push('Valid image URL is required');
  }
  
  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateTestimonial = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Message is required');
  }
  
  if (data.rating !== undefined) {
    if (isNaN(data.rating) || data.rating < 1 || data.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }
  }
  
  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateService = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Service title is required');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  }
  
  if (data.price && isNaN(data.price)) {
    errors.push('Price must be a number');
  }
  
  if (data.featured !== undefined && typeof data.featured !== 'boolean') {
    errors.push('Featured must be a boolean');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateContact = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push('Message is required');
  }
  
  if (data.status && !['new', 'read', 'replied', 'archived'].includes(data.status)) {
    errors.push('Status must be: new, read, replied, or archived');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateContactInfo = (data) => {
  const errors = [];
  
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
    errors.push('Invalid phone format');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateAchievement = (data) => {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Achievement title is required');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required');
  }
  
  if (data.date && isNaN(new Date(data.date).getTime())) {
    errors.push('Invalid date format');
  }
  
  return { valid: errors.length === 0, errors };
};
