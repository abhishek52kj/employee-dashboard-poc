import { ObjectType, Field, ID, Float, Int, registerEnumType } from 'type-graphql';
// Force TS re-check
import { Department, EmployeeStatus, UserRole } from '@prisma/client';

registerEnumType(Department, {
    name: 'Department',
    description: 'Department of the employee',
});

registerEnumType(EmployeeStatus, {
    name: 'EmployeeStatus',
    description: 'Status of the employee',
});

registerEnumType(UserRole, {
    name: 'UserRole',
    description: 'Role of the user',
});

@ObjectType()
export class Employee {
    @Field(() => ID)
    id!: string;

    @Field(() => String, { nullable: true })
    avatar?: string | null;

    @Field()
    name!: string;

    @Field()
    email!: string;

    @Field(() => String, { nullable: true })
    phone?: string | null;

    @Field(() => Int)
    age!: number;

    @Field(() => Department)
    department!: Department;

    @Field()
    position!: string;

    @Field()
    joinDate!: Date;

    @Field(() => Float, { nullable: true })
    salary?: number | null;

    @Field(() => EmployeeStatus)
    status!: EmployeeStatus;

    @Field(() => Float)
    attendance!: number;

    @Field(() => UserRole)
    role!: UserRole;

    @Field()
    createdAt!: Date;

    @Field()
    updatedAt!: Date;
}
