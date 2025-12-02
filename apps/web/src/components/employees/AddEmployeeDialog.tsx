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
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { EmployeeForm, EmployeeFormValues } from "./EmployeeForm"

const CREATE_EMPLOYEE_MUTATION = gql`
    mutation CreateEmployee($input: CreateEmployeeInput!) {
        createEmployee(input: $input) {
            id
            name
        }
    }
`

export function AddEmployeeDialog() {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const { mutate, isPending } = useMutation({
        mutationFn: async (values: EmployeeFormValues) => {
            return client.request(CREATE_EMPLOYEE_MUTATION, {
                input: {
                    ...values,
                    age: Number(values.age),
                    salary: values.salary ? Number(values.salary) : undefined,
                }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] })
            toast.success("Employee added successfully")
            setOpen(false)
        },
        onError: (error) => {
            console.error(error)
            toast.error("Failed to add employee")
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Employee</DialogTitle>
                    <DialogDescription>
                        Add a new employee to the system. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <EmployeeForm
                    onSubmit={(values) => mutate(values)}
                    isLoading={isPending}
                />
            </DialogContent>
        </Dialog>
    )
}
