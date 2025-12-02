import { useState } from "react"
import { useEmployees, EmployeeFilter } from "@/hooks/useEmployees"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { Search, Download } from "lucide-react"
import { AddEmployeeDialog } from "@/components/employees/AddEmployeeDialog"
import { EditEmployeeDialog } from "@/components/employees/EditEmployeeDialog"
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog"
import { CSVLink } from "react-csv"

export default function Employees() {
    const [cursor, setCursor] = useState<string | undefined>(undefined)
    const [filters, setFilters] = useState<EmployeeFilter>({})

    const { data, isLoading, error } = useEmployees(50, cursor, filters) // Fetch more for export if needed, or handle pagination differently

    const handleFilterChange = (key: keyof EmployeeFilter, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === "ALL" ? undefined : value }))
        setCursor(undefined)
    }

    if (error) {
        return <div className="p-6 text-red-500">Error loading employees.</div>
    }

    const csvData = data?.edges.map(emp => ({
        Name: emp.name,
        Email: emp.email,
        Department: emp.department,
        Position: emp.position,
        Status: emp.status,
        Joined: format(new Date(emp.joinDate), 'yyyy-MM-dd'),
        Salary: emp.salary
    })) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
                <div className="flex gap-2">
                    {csvData.length > 0 && (
                        <CSVLink
                            data={csvData}
                            filename={"employees.csv"}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export CSV
                        </CSVLink>
                    )}
                    <AddEmployeeDialog />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9"
                        value={filters.search || ""}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                </div>
                <Select
                    value={filters.department || "ALL"}
                    onValueChange={(val) => handleFilterChange("department", val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Departments</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="ENGINEERING">Engineering</SelectItem>
                        <SelectItem value="SALES">Sales</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.status || "ALL"}
                    onValueChange={(val) => handleFilterChange("status", val)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                        <SelectItem value="TERMINATED">Terminated</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                </TableRow>
                            ))
                        ) : (
                            data?.edges.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">{employee.name}</TableCell>
                                    <TableCell>{employee.email}</TableCell>
                                    <TableCell>{employee.department}</TableCell>
                                    <TableCell>{employee.position}</TableCell>
                                    <TableCell>
                                        <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {employee.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(employee.joinDate), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditEmployeeDialog employee={employee} />
                                            <DeleteEmployeeDialog employeeId={employee.id} employeeName={employee.name} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => setCursor(undefined)}
                    disabled={!cursor}
                >
                    Start Over
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        if (data?.edges.length) {
                            const lastEmployee = data.edges[data.edges.length - 1]
                            setCursor(lastEmployee.id)
                        }
                    }}
                    disabled={!data?.hasNextPage || isLoading}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
