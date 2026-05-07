import axios from 'axios'
import { IBoard, ICard, IList, ILabel } from '@/types'

const api = axios.create({
  baseURL: 'https://newsgov.onrender.com/api',
})

export const boardApi = {
  getAll: () => api.get<IBoard[]>('/boards').then((res) => res.data),
  getById: (id: string) => api.get<IBoard>(`/boards/${id}`).then((res) => res.data),
  create: (data: { title: string; description?: string }) =>
    api.post<IBoard>('/boards', data).then((res) => res.data),
  update: (id: string, data: { title?: string; description?: string }) =>
    api.put<IBoard>(`/boards/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/boards/${id}`),
}

export const listApi = {
  create: (data: { boardId: string; title: string }) =>
    api.post<IList>('/lists', data).then((res) => res.data),
  update: (id: string, data: { title: string }) =>
    api.put<IList>(`/lists/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/lists/${id}`),
  updatePosition: (id: string, position: number) =>
    api.put<IList>(`/lists/${id}/position`, { position }).then((res) => res.data),
}

export const cardApi = {
  getById: (id: string) => api.get<ICard>(`/cards/${id}`).then((res) => res.data),
  create: (data: { listId: string; title: string; description?: string }) =>
    api.post<ICard>('/cards', data).then((res) => res.data),
  update: (
    id: string,
    data: { title?: string; description?: string; labels?: ILabel[]; startDate?: string; dueDate?: string; reminder?: string; completed?: boolean }
  ) => api.put<ICard>(`/cards/${id}`, data).then((res) => res.data),
  delete: (id: string) => api.delete(`/cards/${id}`),
  updatePosition: (id: string, position: number, listId: string) =>
    api.put<ICard>(`/cards/${id}/position`, { position, listId }).then((res) => res.data),
}

export default api
