import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { client } from '@/lib/client'
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

const ACTIVITY_LOGS_QUERY = gql`
  query ActivityLogs {
    activityLogs {
      id
      action
      entity
      details
      createdAt
      user {
        email
        role
      }
    }
  }
`

type ActivityLog = {
    id: string
    action: 'CREATE' | 'UPDATE' | 'DELETE'
    entity: string
    details: string
    createdAt: string
    user: {
        email: string
        role: string
    }
}

export default function ActivityLogs() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['activityLogs'],
        queryFn: async () => {
            const { activityLogs } = await client.request<{ activityLogs: ActivityLog[] }>(ACTIVITY_LOGS_QUERY)
            return activityLogs
        },
    })

    if (error) {
        return <div className="p-6 text-red-500">Error loading activity logs.</div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            data?.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <Badge variant={
                                            log.action === 'CREATE' ? 'default' :
                                                log.action === 'UPDATE' ? 'secondary' : 'destructive'
                                        }>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{log.entity}</TableCell>
                                    <TableCell>{log.details}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{log.user.email}</span>
                                            <span className="text-xs text-muted-foreground">{log.user.role}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
