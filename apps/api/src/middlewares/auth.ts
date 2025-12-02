import { AuthenticationError } from 'apollo-server-express'
import * as jwt from 'jsonwebtoken'
import { AuthChecker } from 'type-graphql'
import { Context } from '../types/context'

const getUser = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string }
  } catch {
    return null
  }
}

export const customAuthChecker: AuthChecker<Context> = ({ context: ctx, args }, roles) => {
  const authHeader = ctx.req.headers.authorization
  if (!authHeader) throw new AuthenticationError('No token provided')

  const token = authHeader.split(' ')[1]
  const user = getUser(token)
  if (!user) throw new AuthenticationError('Invalid token')

  ctx.user = user

  if (roles.length > 0) {
    if (user.role === 'ADMIN') return true; // Admin override for all roles (scalable, secure superset access)
    if (!roles.includes(user.role)) throw new AuthenticationError('Not authorized')
  }

  if (roles.includes('orSelf') && args.id && user.id !== args.id && user.role !== 'ADMIN') throw new AuthenticationError('Not authorized for this record')

  return true
}
