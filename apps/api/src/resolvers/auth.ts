import { Resolver, Mutation, Query, Arg, Ctx, Authorized } from 'type-graphql'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { Context } from '../types/context'
import { User } from '../types/user'
import { ObjectType, Field } from 'type-graphql'

@ObjectType()
class LoginResponse {
  @Field()
  token!: string
}

@Resolver()
export class AuthResolver {
  @Mutation(() => LoginResponse)
  async login(@Arg('email') email: string, @Arg('password') password: string, @Ctx() ctx: Context) {
    const user = await ctx.prisma.user.findUnique({ where: { email } })
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials')
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })
    ctx.res.header('Authorization', `Bearer ${token}`)

    return { token }
  }

  @Authorized(['EMPLOYEE'])
  @Query(() => User)
  async me(@Ctx() ctx: Context) {
    if (!ctx.user) throw new Error('Not authenticated')
    return ctx.prisma.user.findUnique({ where: { id: ctx.user.id } })
  }
}
