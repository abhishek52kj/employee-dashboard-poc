import DataLoader from 'dataloader'
import { PrismaClient } from '@prisma/client'

export const createDataLoaders = (prisma: PrismaClient) => ({
  employeeLoader: new DataLoader(async (ids: readonly string[]) => {
    const employees = await prisma.employee.findMany({
      where: { id: { in: ids as string[] } },
    })
    const employeeMap = new Map(employees.map((emp: { id: any }) => [emp.id, emp]))
    return ids.map(id => employeeMap.get(id) || null)
  }),
})
