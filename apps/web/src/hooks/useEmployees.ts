import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { client } from '@/lib/client'

const EMPLOYEES_QUERY = gql`
  query Employees($limit: Float, $cursor: String, $filter: FilterInput) {
    employees(pagination: { limit: $limit, cursor: $cursor }, filter: $filter) {
      edges {
        id
        name
        email
        age
        department
        position
        status
        role
        salary
        attendance
        joinDate
      }
      totalCount
      hasNextPage
    }
  }
`

export type Employee = {
  id: string
  name: string
  email: string
  age: number
  department: string
  position: string
  status: string
  role: string
  salary?: number
  attendance: number
  joinDate: string
}

type EmployeesResponse = {
  employees: {
    edges: Employee[]
    totalCount: number
    hasNextPage: boolean
  }
}

export type EmployeeFilter = {
  search?: string
  department?: string
  status?: string
}

export function useEmployees(limit = 10, cursor?: string, filter?: EmployeeFilter) {
  return useQuery({
    queryKey: ['employees', limit, cursor, filter],
    queryFn: async () => {
      const { employees } = await client.request<EmployeesResponse>(EMPLOYEES_QUERY, {
        limit,
        cursor,
        filter,
      })
      return employees
    },
  })
}
