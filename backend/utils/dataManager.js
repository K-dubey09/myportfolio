import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');

// Ensure data directory exists
await fs.ensureDir(path.dirname(DATA_FILE));

// Initialize data file if it doesn't exist
if (!await fs.pathExists(DATA_FILE)) {
  const initialData = {
    profile: {
      name: "Your Name",
      title: "Full Stack Developer",
      heroTitle: "Welcome to My Portfolio",
      heroSubtitle: "Full Stack Developer & Creative Problem Solver",
      aboutText: "I'm a passionate developer...",
      email: "your-email@example.com",
      linkedin: "",
      github: "",
      phone: "",
      location: ""
    },
    skills: [],
    projects: [],
    experiences: [],
    education: []
  };
  await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
}

export const loadData = async () => {
  try {
    return await fs.readJson(DATA_FILE);
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

export const saveData = async (data) => {
  try {
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

export const updateProfile = async (profileData) => {
  const data = await loadData();
  if (!data) return false;
  
  data.profile = { ...data.profile, ...profileData };
  return await saveData(data);
};

export const updateSkills = async (skills) => {
  const data = await loadData();
  if (!data) return false;
  
  data.skills = skills;
  return await saveData(data);
};

export const addProject = async (project) => {
  const data = await loadData();
  if (!data) return false;
  
  project.id = Date.now();
  data.projects.push(project);
  return await saveData(data);
};

export const updateProject = async (projectId, projectData) => {
  const data = await loadData();
  if (!data) return false;
  
  const projectIndex = data.projects.findIndex(p => p.id === parseInt(projectId));
  if (projectIndex === -1) return false;
  
  data.projects[projectIndex] = { ...data.projects[projectIndex], ...projectData };
  return await saveData(data);
};

export const deleteProject = async (projectId) => {
  const data = await loadData();
  if (!data) return false;
  
  data.projects = data.projects.filter(p => p.id !== parseInt(projectId));
  return await saveData(data);
};

export const addExperience = async (experience) => {
  const data = await loadData();
  if (!data) return false;
  
  experience.id = Date.now();
  data.experiences.push(experience);
  return await saveData(data);
};

export const updateExperience = async (experienceId, experienceData) => {
  const data = await loadData();
  if (!data) return false;
  
  const expIndex = data.experiences.findIndex(e => e.id === parseInt(experienceId));
  if (expIndex === -1) return false;
  
  data.experiences[expIndex] = { ...data.experiences[expIndex], ...experienceData };
  return await saveData(data);
};

export const deleteExperience = async (experienceId) => {
  const data = await loadData();
  if (!data) return false;
  
  data.experiences = data.experiences.filter(e => e.id !== parseInt(experienceId));
  return await saveData(data);
};

export const addEducation = async (education) => {
  const data = await loadData();
  if (!data) return false;
  
  education.id = Date.now();
  data.education.push(education);
  return await saveData(data);
};

export const updateEducation = async (educationId, educationData) => {
  const data = await loadData();
  if (!data) return false;
  
  const eduIndex = data.education.findIndex(e => e.id === parseInt(educationId));
  if (eduIndex === -1) return false;
  
  data.education[eduIndex] = { ...data.education[eduIndex], ...educationData };
  return await saveData(data);
};

export const deleteEducation = async (educationId) => {
  const data = await loadData();
  if (!data) return false;
  
  data.education = data.education.filter(e => e.id !== parseInt(educationId));
  return await saveData(data);
};

// Blog Management
export const addBlog = async (blog) => {
  const data = await loadData();
  if (!data) return false;
  
  blog.id = Date.now();
  if (!data.blogs) data.blogs = [];
  data.blogs.push(blog);
  return await saveData(data);
};

export const updateBlog = async (blogId, blogData) => {
  const data = await loadData();
  if (!data) return false;
  
  const blogIndex = data.blogs?.findIndex(b => b.id === parseInt(blogId));
  if (blogIndex === -1) return false;
  
  data.blogs[blogIndex] = { ...data.blogs[blogIndex], ...blogData };
  return await saveData(data);
};

export const deleteBlog = async (blogId) => {
  const data = await loadData();
  if (!data) return false;
  
  if (!data.blogs) return false;
  data.blogs = data.blogs.filter(b => b.id !== parseInt(blogId));
  return await saveData(data);
};

// Vlog Management
export const addVlog = async (vlog) => {
  const data = await loadData();
  if (!data) return false;
  
  vlog.id = Date.now();
  if (!data.vlogs) data.vlogs = [];
  data.vlogs.push(vlog);
  return await saveData(data);
};

export const updateVlog = async (vlogId, vlogData) => {
  const data = await loadData();
  if (!data) return false;
  
  const vlogIndex = data.vlogs?.findIndex(v => v.id === parseInt(vlogId));
  if (vlogIndex === -1) return false;
  
  data.vlogs[vlogIndex] = { ...data.vlogs[vlogIndex], ...vlogData };
  return await saveData(data);
};

export const deleteVlog = async (vlogId) => {
  const data = await loadData();
  if (!data) return false;
  
  if (!data.vlogs) return false;
  data.vlogs = data.vlogs.filter(v => v.id !== parseInt(vlogId));
  return await saveData(data);
};

// Gallery Management
export const addGalleryItem = async (item) => {
  const data = await loadData();
  if (!data) return false;
  
  item.id = Date.now();
  if (!data.gallery) data.gallery = [];
  data.gallery.push(item);
  return await saveData(data);
};

export const updateGalleryItem = async (itemId, itemData) => {
  const data = await loadData();
  if (!data) return false;
  
  const itemIndex = data.gallery?.findIndex(g => g.id === parseInt(itemId));
  if (itemIndex === -1) return false;
  
  data.gallery[itemIndex] = { ...data.gallery[itemIndex], ...itemData };
  return await saveData(data);
};

export const deleteGalleryItem = async (itemId) => {
  const data = await loadData();
  if (!data) return false;
  
  if (!data.gallery) return false;
  data.gallery = data.gallery.filter(g => g.id !== parseInt(itemId));
  return await saveData(data);
};

// Testimonial Management
export const addTestimonial = async (testimonial) => {
  const data = await loadData();
  if (!data) return false;
  
  testimonial.id = Date.now();
  if (!data.testimonials) data.testimonials = [];
  data.testimonials.push(testimonial);
  return await saveData(data);
};

export const updateTestimonial = async (testimonialId, testimonialData) => {
  const data = await loadData();
  if (!data) return false;
  
  const testimonialIndex = data.testimonials?.findIndex(t => t.id === parseInt(testimonialId));
  if (testimonialIndex === -1) return false;
  
  data.testimonials[testimonialIndex] = { ...data.testimonials[testimonialIndex], ...testimonialData };
  return await saveData(data);
};

export const deleteTestimonial = async (testimonialId) => {
  const data = await loadData();
  if (!data) return false;
  
  if (!data.testimonials) return false;
  data.testimonials = data.testimonials.filter(t => t.id !== parseInt(testimonialId));
  return await saveData(data);
};