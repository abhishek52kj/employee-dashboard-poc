import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { client } from '@/lib/client'
import { useUser } from "@/hooks/useUser"
import { format } from 'date-fns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const LEAVE_REQUESTS_QUERY = gql`
  query LeaveRequests {
    leaveRequests {
      id
      startDate
      endDate
      reason
      status
      createdAt
    }
  }
`

const CREATE_LEAVE_MUTATION = gql`
  mutation CreateLeaveRequest($input: CreateLeaveInput!) {
    createLeaveRequest(input: $input) {
      id
    }
  }
`

const UPDATE_LEAVE_STATUS_MUTATION = gql`
  mutation UpdateLeaveStatus($id: String!, $status: String!) {
    updateLeaveStatus(id: $id, status: $status) {
      id
      status
    }
  }
`

const createLeaveSchema = z.object({
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    reason: z.string().min(5, "Reason must be at least 5 characters"),
})

type CreateLeaveValues = z.infer<typeof createLeaveSchema>

export default function Leaves() {
    const { data: user } = useUser()
    const queryClient = useQueryClient()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data: leaves, isLoading } = useQuery({
        queryKey: ['leaveRequests'],
        queryFn: async () => {
            const { leaveRequests } = await client.request<{ leaveRequests: any[] }>(LEAVE_REQUESTS_QUERY)
            return leaveRequests
        },
    })

    const createMutation = useMutation({
        mutationFn: async (values: CreateLeaveValues) => {
            await client.request(CREATE_LEAVE_MUTATION, {
                input: {
                    startDate: new Date(values.startDate),
                    endDate: new Date(values.endDate),
                    reason: values.reason
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
            toast.success("Leave request submitted")
            setIsDialogOpen(false)
            form.reset()
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to submit request")
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            await client.request(UPDATE_LEAVE_STATUS_MUTATION, { id, status })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaveRequests'] })
            toast.success("Status updated")
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update status")
        }
    })

    const form = useForm<CreateLeaveValues>({
        resolver: zodResolver(createLeaveSchema),
        defaultValues: {
            startDate: "",
            endDate: "",
            reason: "",
        },
    })

    const onSubmit = (values: CreateLeaveValues) => {
        createMutation.mutate(values)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
                {user?.role === 'EMPLOYEE' && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Request Leave</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Request Leave</DialogTitle>
                                <DialogDescription>
                                    Submit a new leave request.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reason</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <DialogFooter>
                                        <Button type="submit" disabled={createMutation.isPending}>
                                            {createMutation.isPending ? "Submitting..." : "Submit Request"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{user?.role === 'ADMIN' ? 'All Leave Requests' : 'My Leave Requests'}</CardTitle>
                    <CardDescription>
                        {user?.role === 'ADMIN' ? 'Manage employee leave requests.' : 'View status of your leave requests.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date Requested</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                                {user?.role === 'ADMIN' && <TableHead className="text-right">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : leaves?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No leave requests found.</TableCell>
                                </TableRow>
                            ) : (
                                leaves?.map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell>{format(new Date(leave.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            {format(new Date(leave.startDate), 'MMM d')} - {format(new Date(leave.endDate), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell>{leave.reason}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                leave.status === 'APPROVED' ? 'default' :
                                                    leave.status === 'REJECTED' ? 'destructive' : 'secondary'
                                            }>
                                                {leave.status}
                                            </Badge>
                                        </TableCell>
                                        {user?.role === 'ADMIN' && leave.status === 'PENDING' && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => updateStatusMutation.mutate({ id: leave.id, status: 'APPROVED' })}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => updateStatusMutation.mutate({ id: leave.id, status: 'REJECTED' })}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
