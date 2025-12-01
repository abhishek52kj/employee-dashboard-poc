export enum Department { HR = "HR", ENGINEERING = "ENGINEERING", SALES = "SALES", MARKETING = "MARKETING", FINANCE = "FINANCE" }
export enum EmployeeStatus { ACTIVE = "ACTIVE", ON_LEAVE = "ON_LEAVE", TERMINATED = "TERMINATED" }
export enum UserRole { ADMIN = "ADMIN", EMPLOYEE = "EMPLOYEE" }

export interface Employee {
  id: string;
  avatar?: string | null;
  name: string;
  email: string;
  age: number;
  department: Department;
  position: string;
  joinDate: string;
  status: EmployeeStatus;
  attendance: number;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
