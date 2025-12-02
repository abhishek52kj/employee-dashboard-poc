import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

export interface Context {
  req: Request
  res: Response
  prisma: PrismaClient
  user?: { id: string; role: string }
  dataLoaders: any
}
