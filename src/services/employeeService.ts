import type { Employee, EmployeeFormInput } from "../types/employee";

let employees: Employee[] = [
  {
    id: "e1",
    name: "Sabbir Hossain",
    email: "sabbir.hossain@nanosoft.com",
    phone: "01711-000001",
    department: "Software",
    designation: "Backend Developer",
    managerId: "m1",
    managerName: "Kamrul Islam",
    joinDate: "2023-02-14",
    status: "active",
  },
  {
    id: "e2",
    name: "Rahim Ahmed",
    email: "rahim.ahmed@nanosoft.com",
    phone: "01711-000002",
    department: "Software",
    designation: "Frontend Developer",
    managerId: "m1",
    managerName: "Kamrul Islam",
    joinDate: "2023-05-02",
    status: "active",
  },
  {
    id: "e3",
    name: "Hasan Mahmud",
    email: "hasan.mahmud@nanosoft.com",
    phone: "01711-000003",
    department: "Design",
    designation: "UI/UX Designer",
    managerId: "m2",
    managerName: "Nasrin Akter",
    joinDate: "2022-11-20",
    status: "active",
  },
  {
    id: "e4",
    name: "Farhana Islam",
    email: "farhana.islam@nanosoft.com",
    phone: "01711-000004",
    department: "QA",
    designation: "QA Engineer",
    managerId: "m3",
    managerName: "Shahriar Kabir",
    joinDate: "2024-01-08",
    status: "inactive",
  },
];

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 250));

export const getEmployees = (): Promise<Employee[]> => {
  return delay([...employees]);
};

export const createEmployee = (input: EmployeeFormInput): Promise<Employee> => {
  const employee: Employee = { id: crypto.randomUUID(), ...input };
  employees = [employee, ...employees];
  return delay(employee);
};

export const updateEmployee = (
  id: string,
  input: EmployeeFormInput,
): Promise<Employee> => {
  employees = employees.map((employee) =>
    employee.id === id ? { id, ...input } : employee,
  );

  return delay({ id, ...input });
};

export const deleteEmployee = (id: string): Promise<void> => {
  employees = employees.filter((employee) => employee.id !== id);
  return delay(undefined);
};
