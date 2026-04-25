import axios from 'axios'
import { LoginRequest, RegisterRequest } from '../types/auth'


// axis dependecy allows me to no need to write fetch, convert to json, setting the headres for all the functions, error handling
// its rlly rlly good for when access toekne xpires every 15 mins 
// this is to just send info from the frontend to the backend !!



const api = axios.create({
    baseURL: 'http://localhost:3000'
})

export const register = (data: RegisterRequest) => 
    api.post('/auth/register', data)


export const login = (data: LoginRequest) => 
    api.post('/auth/signin', data)

export const refresh = (refreshToken: string) => 
    api.post('/auth/refresh', {refreshToken}) // this is to give the backend their refresh token they have

export const logout = (accessToken: string, refreshToken: string) =>
    api.post('/auth/signout', { refreshToken }, {
        headers: { Authorization: `Bearer ${accessToken}` }
    })
