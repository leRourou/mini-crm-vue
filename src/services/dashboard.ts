import api from './api'

export interface DashboardStats {
  contacts: number
  companies: number
  opportunities: number
  tasks: number
  notes: number
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<{success: boolean, data: DashboardStats}>('/dashboard/stats')
    return response.data.data
  }
}