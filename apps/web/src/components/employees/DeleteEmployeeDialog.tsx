import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { gql } from "graphql-request"
import { client } from "@/lib/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

const DELETE_EMPLOYEE_MUTATION = gql`
    mutation DeleteEmployee($id: String!) {
        deleteEmployee(id: $id)
    }
`

interface DeleteEmployeeDialogProps {
    employeeId: string
    employeeName: string
}

export function DeleteEmployeeDialog({ employeeId, employeeName }: DeleteEmployeeDialogProps) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            return client.request(DELETE_EMPLOYEE_MUTATION, { id: employeeId })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            toast.success("Employee deleted successfully")
            setOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to delete employee")
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Employee</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <strong>{employeeName}</strong>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
