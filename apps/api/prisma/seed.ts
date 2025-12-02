import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
    const departments = ['HR', 'ENGINEERING', 'SALES', 'MARKETING', 'FINANCE'] as const
    const statuses = ['ACTIVE', 'ON_LEAVE', 'TERMINATED'] as const
    const roles = ['ADMIN', 'EMPLOYEE'] as const

    // Seed 2 admins
    for (let i: number = 0; i < 2; i++) {
        const email = `admin${i + 1}@example.com`
        const hashedPassword = await bcrypt.hash('password', 10)
        await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                role: 'ADMIN',
                employee: {
                    create: {
                        name: faker.person.fullName(),
                        email: email,
                        age: faker.number.int({ min: 25, max: 60 }),
                        department: faker.helpers.arrayElement(departments),
                        position: 'Admin',
                        joinDate: faker.date.past(),
                        salary: faker.number.float({ min: 80000, max: 150000, fractionDigits: 2 }),
                        status: 'ACTIVE',
                        attendance: faker.number.int({ min: 80, max: 100 }),
                        role: 'ADMIN',
                    },
                },
            },
        })
        console.log(`Seeded admin ${i + 1}`)
    }

    // Seed 98 employees
    for (let i: number = 0; i < 98; i++) {
        const email = faker.internet.email()
        const hashedPassword = await bcrypt.hash('password', 10)
        await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                role: faker.helpers.arrayElement(roles),
                employee: {
                    create: {
                        name: faker.person.fullName(),
                        email: email,
                        phone: faker.phone.number(),
                        age: faker.number.int({ min: 22, max: 60 }),
                        department: faker.helpers.arrayElement(departments),
                        position: faker.person.jobTitle(),
                        joinDate: faker.date.past({ years: 5 }),
                        salary: faker.number.float({ min: 40000, max: 120000, fractionDigits: 2 }),
                        status: faker.helpers.arrayElement(statuses),
                        attendance: faker.number.int({ min: 70, max: 100 }),
                        role: faker.helpers.arrayElement(roles),
                        avatar: faker.image.avatar(),
                    },
                },
            },
        })
        if (i % 10 === 0) console.log(`Seeded ${i} employees`)
    }

    console.log('Seeded 100 users/employees successfully')
}

main()
    .catch(e => {
        console.error('Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
