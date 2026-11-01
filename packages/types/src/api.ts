// API Request/Response Types

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Config API types
export interface AppConfig {
  name: string
  status: string
}

export interface UpdateConfigRequest {
  name: string
}

export interface UpdateConfigResponse {
  success: boolean
  name: string
}
