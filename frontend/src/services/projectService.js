import api from './api';

export const projectService = {
  async getProjects() {
    const res = await api.get('/projects');
    return res.data;
  },

  async getProjectById(id) {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },

  async createProject(projectData) {
    const res = await api.post('/projects', projectData);
    return res.data;
  },

  async deleteProject(id) {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  async createDesign(designData) {
    const res = await api.post('/designs', designData);
    return res.data;
  },

  async getDesignById(id) {
    const res = await api.get(`/designs/${id}`);
    return res.data;
  },

  async seedDemoData() {
    const res = await api.post('/seed');
    return res.data;
  }
};
