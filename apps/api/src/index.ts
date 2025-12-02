import 'reflect-metadata'
import './utils/registerEnums' // Register enums early
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import express from 'express'
import { Application, RequestHandler } from 'express' // Explicit types for scalability
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pino from 'pino'
import { PrismaClient } from '@prisma/client'
import { EmployeeResolver } from './resolvers/employee'
import { AuthResolver } from './resolvers/auth'
import { DashboardResolver } from './resolvers/dashboard'
import { ActivityLogResolver } from './resolvers/activity-log'
import { LeaveResolver } from './resolvers/leave'
import { createDataLoaders } from './utils/dataLoaders'
import { customAuthChecker } from './middlewares/auth'
import { Context } from './types/context'
import * as jwt from 'jsonwebtoken'

const logger = pino({ level: 'info' })

async function main() {
  const prisma = new PrismaClient()

  const schema = await buildSchema({
    resolvers: [EmployeeResolver, AuthResolver, DashboardResolver, ActivityLogResolver, LeaveResolver],
    validate: true,
    authChecker: customAuthChecker,
  })

  const app = express() as unknown as Application // Strong cast to fix type mismatch

  app.use(helmet())
  app.use(cors({ origin: '*' })) // Change to frontend URL in prod
  app.use(express.json())
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }) as unknown as RequestHandler) // Strong cast for type safety
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      try {
        (req as any).user = jwt.verify(token, process.env.JWT_SECRET as string)
      } catch { }
    }
    (req as any).context = { prisma, dataLoaders: createDataLoaders(prisma) } as Context
    next()
  })

  const server = new ApolloServer({
    schema: schema as any, // Cast to fix schema type mismatch
    context: ({ req, res }): Context => ({
      req: req as any,
      res: res as any,
      prisma,
      dataLoaders: createDataLoaders(prisma),
      user: (req as any).user,
    }),
    introspection: true,
    persistedQueries: false, // Change to false to fix type, perf can be added later if needed
  })

  await server.start()
  server.applyMiddleware({ app: app as any }) // Cast to fix type mismatch

  const PORT = process.env.PORT || 4000
  app.listen(PORT, () => logger.info(`Server ready at http://localhost:${PORT}/graphql`))
}

main().catch(e => logger.error(e))
