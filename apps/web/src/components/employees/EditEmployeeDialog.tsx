import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { gql } from "graphql-request"
import { client } from "@/lib/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { EmployeeForm, EmployeeFormValues } from "./EmployeeForm"

const UPDATE_EMPLOYEE_MUTATION = gql`
    mutation UpdateEmployee($id: String!, $input: UpdateEmployeeInput!) {
        updateEmployee(id: $id, input: $input) {
            id
            name
        }
    }
`

interface EditEmployeeDialogProps {
    employee: any // Replace with proper type
}

export function EditEmployeeDialog({ employee }: EditEmployeeDialogProps) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: EmployeeFormValues) => {
            return client.request(UPDATE_EMPLOYEE_MUTATION, {
                id: employee.id,
                input: {
                    ...values,
                    age: Number(values.age),
                    salary: values.salary ? Number(values.salary) : undefined,
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            toast.success("Employee updated successfully")
            setOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to update employee")
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Make changes to employee profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <EmployeeForm
                    initialData={{
                        name: employee.name,
                        email: employee.email,
                        age: employee.age,
                        department: employee.department,
                        position: employee.position,
                        salary: employee.salary,
                        status: employee.status,
                        role: employee.role,
                        joinDate: new Date(employee.joinDate).toISOString().split('T')[0],
                    }}
                    onSubmit={(values) => mutate(values)}
                    isLoading={isPending}
                    submitLabel="Save Changes"
                />
            </DialogContent>
        </Dialog>
    )
}
