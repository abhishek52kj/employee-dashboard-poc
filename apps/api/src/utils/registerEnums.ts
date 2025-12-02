import { registerEnumType } from 'type-graphql'
// Force TS re-check
import { Department, EmployeeStatus, UserRole } from '@prisma/client'

registerEnumType(Department, {
  name: 'Department',
  description: 'Employee departments',
})

registerEnumType(EmployeeStatus, {
  name: 'EmployeeStatus',
  description: 'Employee statuses',
})

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'User roles',
})
