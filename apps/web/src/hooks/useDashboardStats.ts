import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { client } from '@/lib/client'

const DASHBOARD_STATS_QUERY = gql`
  query DashboardStats {
    dashboardStats {
      totalEmployees
      activeDepartments
      attendanceRate
      pendingRequests
      departmentDistribution {
        department
        count
      }
      salaryByDepartment {
        department
        averageSalary
      }
    }
  }
`

type DashboardStats = {
  totalEmployees: number
  activeDepartments: number
  attendanceRate: number
  pendingRequests: number
  departmentDistribution: {
    department: string
    count: number
  }[]
  salaryByDepartment: {
    department: string
    averageSalary: number
  }[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { dashboardStats } = await client.request<{ dashboardStats: DashboardStats }>(
        DASHBOARD_STATS_QUERY
      )
      return dashboardStats
    },
  })
}
