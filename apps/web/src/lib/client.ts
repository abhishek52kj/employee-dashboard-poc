import { GraphQLClient } from 'graphql-request'

const API_URL = 'http://localhost:4000/graphql'

export const client = new GraphQLClient(API_URL, {
    requestMiddleware: (request) => {
        const token = localStorage.getItem('token')
        return {
            ...request,
            headers: {
                ...request.headers,
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    },
})
