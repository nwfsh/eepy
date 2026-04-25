

//  is just describing the shape of your data to TypeScript
// there is one in backend and one for frontend, both for different purposees
// backend one is for telling how servre what data looks like for processing
//  frontend is for telling how data looks like when it recieves it
export interface User {
  id: string
  email: string
  preferred_name: string
  pronouns: string
  timezone: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  preferred_name: string
  pronouns: string
  timezone: string
}