import { ObjectType, Field, ID } from 'type-graphql'
// Force TS re-check;
import { UserRole } from '@prisma/client';

@ObjectType()
export class User {
    @Field(() => ID)
    id!: string;

    @Field()
    email!: string;

    @Field(() => UserRole)
    role!: UserRole;

    @Field({ nullable: true })
    employeeId?: string;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;
}
