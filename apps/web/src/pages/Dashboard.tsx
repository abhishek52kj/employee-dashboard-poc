import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { gql } from 'graphql-request'
import { client } from '@/lib/client'

import { useDashboardStats } from "@/hooks/useDashboardStats"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { toast } from "sonner"

const EXPORT_EMPLOYEES_QUERY = gql`
  query ExportEmployees {
    exportEmployees {
      id
      name
      email
      role
      department
      position
      status
      joinDate
      salary
    }
  }
`

export default function Dashboard() {
    const { data: stats, isLoading, error } = useDashboardStats()
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownloadReport = async () => {
        try {
            setIsDownloading(true)
            const { exportEmployees } = await client.request<{ exportEmployees: any[] }>(EXPORT_EMPLOYEES_QUERY)

            const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Position', 'Status', 'Join Date', 'Salary']
            const csvContent = [
                headers.join(','),
                ...exportEmployees.map(emp => [
                    emp.id,
                    `"${emp.name}"`,
                    emp.email,
                    emp.role,
                    emp.department,
                    emp.position,
                    emp.status,
                    emp.joinDate,
                    emp.salary
                ].join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                link.setAttribute('download', `employees_report_${new Date().toISOString().split('T')[0]}.csv`)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
            toast.success("Report downloaded successfully")
        } catch (error) {
            console.error('Failed to download report:', error)
            toast.error("Failed to download report")
        } finally {
            setIsDownloading(false)
        }
    }

    if (error) {
        return <div className="p-6 text-red-500">Error loading dashboard stats.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <Button onClick={handleDownloadReport} disabled={isDownloading}>
                    {isDownloading ? 'Downloading...' : 'Download Report'}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.totalEmployees}</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.activeDepartments}</div>
                                <p className="text-xs text-muted-foreground">+2 new departments</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.attendanceRate}%</div>
                                <p className="text-xs text-muted-foreground">+1.2% from last week</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-20" />
                        ) : (
                            <>
                                <div className="text-2xl font-bold">{stats?.pendingRequests}</div>
                                <p className="text-xs text-muted-foreground">-5 since yesterday</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Chart Placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            You made 265 sales this month.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Olivia Martin</p>
                                    <p className="text-sm text-muted-foreground">olivia.martin@email.com</p>
                                </div>
                                <div className="ml-auto font-medium">+$1,999.00</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
