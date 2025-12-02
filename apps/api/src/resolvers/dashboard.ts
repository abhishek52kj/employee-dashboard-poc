import { Resolver, Query, Ctx, ObjectType, Field, Authorized } from 'type-graphql'
import { Context } from '../types/context'

@ObjectType()
class DepartmentDistribution {
    @Field()
    department!: string

    @Field()
    count!: number
}

@ObjectType()
class SalaryByDepartment {
    @Field()
    department!: string

    @Field()
    averageSalary!: number
}

@ObjectType()
class DashboardStats {
    @Field()
    totalEmployees!: number

    @Field()
    activeDepartments!: number

    @Field()
    attendanceRate!: number

    @Field()
    pendingRequests!: number

    @Field(() => [DepartmentDistribution])
    departmentDistribution!: DepartmentDistribution[]

    @Field(() => [SalaryByDepartment])
    salaryByDepartment!: SalaryByDepartment[]
}

@Resolver()
export class DashboardResolver {
    @Authorized(['EMPLOYEE'])
    @Query(() => DashboardStats)
    async dashboardStats(@Ctx() ctx: Context): Promise<DashboardStats> {
        const totalEmployees = await ctx.prisma.employee.count()

        // Count unique departments that have employees
        const departments = await ctx.prisma.employee.groupBy({
            by: ['department'],
            _count: {
                department: true
            },
            _avg: {
                salary: true
            }
        })
        const activeDepartments = departments.length

        const departmentDistribution = departments.map(d => ({
            department: d.department,
            count: d._count.department
        }))

        const salaryByDepartment = departments.map(d => ({
            department: d.department,
            averageSalary: Math.round(d._avg.salary || 0)
        }))

        // Mocked data for now
        const attendanceRate = 95.4
        const pendingRequests = 23

        return {
            totalEmployees,
            activeDepartments,
            attendanceRate,
            pendingRequests,
            departmentDistribution,
            salaryByDepartment,
        }
    }
}
