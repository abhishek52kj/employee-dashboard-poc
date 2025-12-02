import { Resolver, Query, Mutation, Arg, Ctx, Authorized, ObjectType, Field, ID, registerEnumType, InputType } from 'type-graphql'
import { Context } from '../types/context'
import { User } from '../types/user'
import { LeaveStatus } from '@prisma/client'
import { IsString, IsDate, IsEnum } from 'class-validator'

registerEnumType(LeaveStatus, {
    name: 'LeaveStatus',
})

@ObjectType()
class LeaveRequest {
    @Field(() => ID)
    id!: string

    @Field(() => Date)
    startDate!: Date

    @Field(() => Date)
    endDate!: Date

    @Field()
    reason!: string

    @Field(() => LeaveStatus)
    status!: LeaveStatus

    @Field()
    employeeId!: string

    @Field(() => Date)
    createdAt!: Date
}

@InputType()
class CreateLeaveInput {
    @Field(() => Date)
    @IsDate()
    startDate!: Date

    @Field(() => Date)
    @IsDate()
    endDate!: Date

    @Field()
    @IsString()
    reason!: string
}

@Resolver()
export class LeaveResolver {
    @Authorized(['EMPLOYEE'])
    @Query(() => [LeaveRequest])
    async leaveRequests(@Ctx() ctx: Context) {
        if (!ctx.user) throw new Error('Not authenticated')

        if (ctx.user.role === 'ADMIN') {
            return ctx.prisma.leaveRequest.findMany({
                orderBy: { createdAt: 'desc' },
            })
        } else {
            // If employee ID is same as User ID, this works. If not, we need to find employee by User ID relation.
            // Schema says: user User @relation(fields: [userId], references: [id]) in Employee model?
            // No, Schema says: user User? @relation("UserToEmployee") in Employee model.
            // And User model has: employee Employee? @relation("UserToEmployee", fields: [employeeId], references: [id])?
            // Let's check schema.

            // Actually, let's look at how we link them.
            // User model: employee Employee?
            // Employee model: user User?

            // If I have ctx.user.id, I can find the User, and include Employee.
            const user = await ctx.prisma.user.findUnique({
                where: { id: ctx.user.id },
                include: { employee: true }
            })

            if (!user?.employee) throw new Error('Employee profile not found')

            return ctx.prisma.leaveRequest.findMany({
                where: { employeeId: user.employee.id },
                orderBy: { createdAt: 'desc' },
            })
        }
    }

    @Authorized(['EMPLOYEE'])
    @Mutation(() => LeaveRequest)
    async createLeaveRequest(@Arg('input') input: CreateLeaveInput, @Ctx() ctx: Context) {
        if (!ctx.user) throw new Error('Not authenticated')

        const user = await ctx.prisma.user.findUnique({
            where: { id: ctx.user.id },
            include: { employee: true }
        })

        if (!user?.employee) throw new Error('Employee profile not found')

        const leave = await ctx.prisma.leaveRequest.create({
            data: {
                ...input,
                employeeId: user.employee.id,
                status: 'PENDING',
            },
        })

        // Log activity
        await ctx.prisma.activityLog.create({
            data: {
                action: 'CREATE',
                entity: 'LeaveRequest',
                details: `Requested leave from ${input.startDate} to ${input.endDate}`,
                userId: ctx.user.id
            }
        })

        return leave
    }

    @Authorized(['ADMIN'])
    @Mutation(() => LeaveRequest)
    async updateLeaveStatus(
        @Arg('id') id: string,
        @Arg('status', () => LeaveStatus) status: LeaveStatus,
        @Ctx() ctx: Context
    ) {
        if (!ctx.user) throw new Error('Not authenticated')

        const leave = await ctx.prisma.leaveRequest.update({
            where: { id },
            data: { status },
        })

        // Log activity
        await ctx.prisma.activityLog.create({
            data: {
                action: 'UPDATE',
                entity: 'LeaveRequest',
                details: `Updated leave request status to ${status}`,
                userId: ctx.user.id
            }
        })

        return leave
    }
}
