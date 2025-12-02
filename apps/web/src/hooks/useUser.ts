import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { client } from '@/lib/client'

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
    }
  }
`

export type User = {
    id: string
    email: string
    role: 'ADMIN' | 'EMPLOYEE'
}

export function useUser() {
    return useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            try {
                const { me } = await client.request<{ me: User }>(ME_QUERY)
                return me
            } catch (error) {
                return null
            }
        },
        retry: false,
    })
}
