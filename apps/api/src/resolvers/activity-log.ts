import { Resolver, Query, Ctx, Authorized, ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { Context } from '../types/context'
import { User } from '../types/user'
import { ActionType } from '@prisma/client'

registerEnumType(ActionType, {
    name: 'ActionType',
})

@ObjectType()
class ActivityLog {
    @Field(() => ID)
    id!: string

    @Field(() => ActionType)
    action!: ActionType

    @Field()
    entity!: string

    @Field()
    details!: string

    @Field(() => User)
    user!: User

    @Field()
    createdAt!: Date
}

@Resolver()
export class ActivityLogResolver {
    @Authorized(['ADMIN', 'EMPLOYEE'])
    @Query(() => [ActivityLog])
    async activityLogs(@Ctx() ctx: Context) {
        return ctx.prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: true },
        })
    }
}
