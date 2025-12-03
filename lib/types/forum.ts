// Types pour le module Forum

export interface UserInfo {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar?: string
  avatar_url?: string
  position?: string
  department?: string
}

export interface Forum {
  id: number
  title: string
  image?: string | null
  image_url?: string | null
  created_by: number
  created_by_info: UserInfo
  created_at: string
  updated_at: string
  is_active: boolean
  message_count: number
  participant_count: number
  last_message?: {
    created_at: string
    author: string
  } | null
}

export interface ForumMessage {
  id: number
  forum: number
  author: number
  author_info: UserInfo
  content: string
  created_at: string
  updated_at: string
  is_edited: boolean
}

export interface ForumCreateData {
  title: string
  image?: File | null
}

export interface ForumUpdateData {
  title?: string
  image?: File | null
}

export interface ForumMessageCreateData {
  content: string
}

export interface ForumFilters {
  search?: string
  sort?: 'recent' | 'oldest' | 'popular' | 'active'
}

export const FORUM_SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récent' },
  { value: 'oldest', label: 'Plus ancien' },
  { value: 'popular', label: 'Plus populaire' },
  { value: 'active', label: 'Plus actif' },
] as const

