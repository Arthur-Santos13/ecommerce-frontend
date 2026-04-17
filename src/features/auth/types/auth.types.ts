export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    refreshToken: string
    username: string
    roles: string[]
}

export interface RefreshRequest {
    refreshToken: string
}

export interface AuthUser {
    username: string
    roles: string[]
    exp: number
}
