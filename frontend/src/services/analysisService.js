import api from './api';

export const analysisService = {
  async analyzeBuilding(payload) {
    const res = await api.post('/analyze', payload);
    return res.data;
  },

  async getAnalysisByDesignId(designId) {
    const res = await api.get(`/analysis/${designId}`);
    return res.data;
  },

  async getRecommendations(designId) {
    const res = await api.get(`/recommendations/${designId}`);
    return res.data;
  },

  async compareDesigns(designAId, designBId) {
    const res = await api.post('/compare', {
      design_a_id: designAId,
      design_b_id: designBId
    });
    return res.data;
  },

  async optimizeDesign(designId, priority, parameters = null) {
    const payload = { priority };
    if (designId) payload.design_id = designId;
    if (parameters) payload.parameters = parameters;
    const res = await api.post('/optimize', payload);
    return res.data;
  },

  async getReport(projectId) {
    const res = await api.get(`/reports/${projectId}`);
    return res.data;
  },

  getReportPdfUrl(projectId) {
    const baseUrl = api.defaults.baseURL || 'http://localhost:8000/api';
    return `${baseUrl}/reports/${projectId}/pdf`;
  }
};
