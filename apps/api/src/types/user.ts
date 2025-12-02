import { ObjectType, Field, ID } from 'type-graphql'
// Force TS re-check
import { UserRole } from '@prisma/client'

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  email!: string

  @Field(() => UserRole)
  role!: UserRole

  @Field(() => Date)
  createdAt!: Date

  @Field(() => Date)
  updatedAt!: Date
}