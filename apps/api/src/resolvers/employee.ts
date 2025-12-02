import { Resolver, Query, Mutation, Arg, Ctx, InputType, Field, ObjectType, Authorized, registerEnumType, FieldResolver, Root } from 'type-graphql'
import { Department, EmployeeStatus, UserRole } from '@prisma/client'
import type { Employee } from '@prisma/client'
import { User } from '../types/user'
import { Context } from '../types/context'
import { IsOptional, IsEnum, IsInt, IsString, Min, Max, IsDate } from 'class-validator'

registerEnumType(Department, { name: 'Department' })
registerEnumType(EmployeeStatus, { name: 'EmployeeStatus' })
registerEnumType(UserRole, { name: 'UserRole' })

@ObjectType()
class EmployeeModel {
  @Field(() => String)
  id!: string

  @Field(() => String, { nullable: true })
  avatar?: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  email!: string

  @Field(() => String, { nullable: true })
  phone?: string

  @Field(() => Number)
  age!: number

  @Field(() => Department)
  department!: Department

  @Field(() => String)
  position!: string

  @Field(() => Date)
  joinDate!: Date

  @Field(() => Number, { nullable: true })
  salary?: number

  @Field(() => EmployeeStatus)
  status!: EmployeeStatus

  @Field(() => Number)
  attendance!: number

  @Field(() => UserRole)
  role!: UserRole

  @Field(() => Date)
  createdAt!: Date

  @Field(() => Date)
  @Field(() => Date)
  updatedAt!: Date

  @Field(() => User, { nullable: true })
  user?: User
}

@InputType()
class CreateEmployeeInput {
  @Field(() => String)
  @IsString()
  name!: string

  @Field(() => String)
  @IsString()
  email!: string

  @Field(() => Number)
  @IsInt()
  age!: number

  @Field(() => String)
  @IsString()
  department!: string // Changed to string, map in resolver

  @Field(() => String)
  @IsString()
  position!: string

  @Field(() => Date)
  @IsDate()
  joinDate!: Date

  @Field(() => Number, { nullable: true })
  @IsOptional()
  salary?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string // Changed to string

  @Field(() => Number, { nullable: true })
  @IsOptional()
  attendance?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  role?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string
}

@InputType()
class UpdateEmployeeInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email?: string

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  age?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  department?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  position?: string

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  joinDate?: Date

  @Field(() => Number, { nullable: true })
  @IsOptional()
  salary?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string

  @Field(() => Number, { nullable: true })
  @IsOptional()
  attendance?: number

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  role?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string
}

@ObjectType()
class EmployeeConnection {
  @Field(() => [EmployeeModel])
  edges!: EmployeeModel[]

  @Field()
  totalCount!: number

  @Field()
  hasNextPage!: boolean
}

@InputType()
class PaginationInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  cursor?: string

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @Min(1)
  @Max(50)
  limit?: number = 10
}

@InputType()
class SortInput {
  @Field(() => String)
  @IsString()
  field!: string

  @Field(() => String)
  @IsString()
  direction!: string
}

@InputType()
class FilterInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  department?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  status?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  ageMin?: number

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  ageMax?: number
}

@Resolver(EmployeeModel)
export class EmployeeResolver {
  @Authorized(['EMPLOYEE'])
  @Query(() => EmployeeModel, { nullable: true })
  async employee(@Arg('id') id: string, @Ctx() ctx: Context) {
    return ctx.dataLoaders.employeeLoader.load(id)
  }

  @Authorized(['EMPLOYEE'])
  @Query(() => EmployeeConnection)
  async employees(
    @Arg('filter', () => FilterInput, { nullable: true }) filter: FilterInput,
    @Arg('sort', () => SortInput, { nullable: true }) sort: SortInput,
    @Arg('pagination', () => PaginationInput) pagination: PaginationInput,
    @Ctx() ctx: Context,
  ) {
    const departmentMap: Record<string, Department> = {
      'hr': 'HR',
      'engineering': 'ENGINEERING',
      'sales': 'SALES',
      'marketing': 'MARKETING',
      'finance': 'FINANCE',
    }
    const statusMap: Record<string, EmployeeStatus> = {
      'active': 'ACTIVE',
      'on_leave': 'ON_LEAVE',
      'terminated': 'TERMINATED',
    }

    const where = {
      department: filter?.department ? departmentMap[filter.department.toLowerCase()] : undefined,
      status: filter?.status ? statusMap[filter.status.toLowerCase()] : undefined,
      age: { gte: filter?.ageMin, lte: filter?.ageMax },
      OR: filter?.search ? [
        { name: { contains: filter.search, mode: 'insensitive' as const } },
        { email: { contains: filter.search, mode: 'insensitive' as const } },
      ] : undefined,
    }

    const validFields = ['id', 'name', 'email', 'age', 'department', 'position', 'joinDate', 'salary', 'status', 'attendance', 'role', 'createdAt', 'updatedAt']
    if (sort && !validFields.includes(sort.field)) {
      throw new Error('Invalid sort field')
    }

    const direction = sort?.direction.toLowerCase() as 'asc' | 'desc' || 'asc'

    const orderBy = sort ? { [sort.field]: direction } : { name: 'asc' as const }

    const employees = await ctx.prisma.employee.findMany({
      where,
      orderBy,
      take: pagination.limit,
      skip: pagination.cursor ? 1 : undefined,
      cursor: pagination.cursor ? { id: pagination.cursor } : undefined,
    })

    const totalCount = await ctx.prisma.employee.count({ where })
    const hasNextPage = employees.length === pagination.limit

    return { edges: employees, totalCount, hasNextPage }
  }

  @Authorized(['ADMIN'])
  @Query(() => [EmployeeModel])
  async exportEmployees(@Ctx() ctx: Context) {
    return ctx.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    })
  }

  @Authorized(['ADMIN'])
  @Mutation(() => EmployeeModel)
  async createEmployee(@Arg('input') input: CreateEmployeeInput, @Ctx() ctx: Context) {
    const departmentMap: Record<string, Department> = {
      'hr': 'HR',
      'engineering': 'ENGINEERING',
      'sales': 'SALES',
      'marketing': 'MARKETING',
      'finance': 'FINANCE',
    }
    const statusMap: Record<string, EmployeeStatus> = {
      'active': 'ACTIVE',
      'on_leave': 'ON_LEAVE',
      'terminated': 'TERMINATED',
    }
    const roleMap: Record<string, UserRole> = {
      'admin': 'ADMIN',
      'employee': 'EMPLOYEE',
    }

    const mappedInput = {
      ...input,
      department: departmentMap[input.department.toLowerCase()] || input.department as Department,
      status: input.status ? statusMap[input.status.toLowerCase()] || input.status as EmployeeStatus : 'ACTIVE',
      role: input.role ? roleMap[input.role.toLowerCase()] || input.role as UserRole : 'EMPLOYEE',
    }

    const employee = await ctx.prisma.employee.create({ data: mappedInput })

    if (ctx.user) {
      await ctx.prisma.activityLog.create({
        data: {
          action: 'CREATE',
          entity: 'Employee',
          details: `Created employee ${employee.name}`,
          userId: ctx.user.id,
        },
      })
    }

    return employee
  }

  @Authorized(['orSelf'])
  @Mutation(() => EmployeeModel)
  async updateEmployee(@Arg('id') id: string, @Arg('input') input: UpdateEmployeeInput, @Ctx() ctx: Context) {
    const departmentMap: Record<string, Department> = {
      'hr': 'HR',
      'engineering': 'ENGINEERING',
      'sales': 'SALES',
      'marketing': 'MARKETING',
      'finance': 'FINANCE',
    }
    const statusMap: Record<string, EmployeeStatus> = {
      'active': 'ACTIVE',
      'on_leave': 'ON_LEAVE',
      'terminated': 'TERMINATED',
    }
    const roleMap: Record<string, UserRole> = {
      'admin': 'ADMIN',
      'employee': 'EMPLOYEE',
    }

    const mappedInput = {
      ...input,
      department: input.department ? departmentMap[input.department.toLowerCase()] : undefined,
      status: input.status ? statusMap[input.status.toLowerCase()] : undefined,
      role: input.role ? roleMap[input.role.toLowerCase()] : undefined,
    }

    const employee = await ctx.prisma.employee.update({ where: { id }, data: mappedInput })

    if (ctx.user) {
      await ctx.prisma.activityLog.create({
        data: {
          action: 'UPDATE',
          entity: 'Employee',
          details: `Updated employee ${employee.name}`,
          userId: ctx.user.id,
        },
      })
    }

    return employee
  }

  @Authorized(['ADMIN'])
  @Mutation(() => Boolean)
  async deleteEmployee(@Arg('id') id: string, @Ctx() ctx: Context) {
    const employee = await ctx.prisma.employee.findUnique({ where: { id } })
    if (!employee) return false

    await ctx.prisma.employee.delete({ where: { id } })

    if (ctx.user) {
      await ctx.prisma.activityLog.create({
        data: {
          action: 'DELETE',
          entity: 'Employee',
          details: `Deleted employee ${employee.name}`,
          userId: ctx.user.id,
        },
      })
    }

    return true
  }

  @FieldResolver(() => User, { nullable: true })
  async user(@Root() employee: Employee, @Ctx() ctx: Context) {
    if (!employee.id) return null
    return ctx.dataLoaders.userByEmployeeIdLoader.load(employee.id)
  }
}
