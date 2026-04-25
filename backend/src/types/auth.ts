export interface User {
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