import type { Manager, ManagerFormInput, ManagerOption } from "../types/manager";

let managers: Manager[] = [
  {
    id: "m1",
    name: "Kamrul Islam",
    email: "kamrul.islam@nanosoft.com",
    phone: "01711-100001",
    department: "Software",
    status: "active",
  },
  {
    id: "m2",
    name: "Nasrin Akter",
    email: "nasrin.akter@nanosoft.com",
    phone: "01711-100002",
    department: "Design",
    status: "active",
  },
  {
    id: "m3",
    name: "Shahriar Kabir",
    email: "shahriar.kabir@nanosoft.com",
    phone: "01711-100003",
    department: "QA",
    status: "active",
  },
];

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), 250));

export const getManagerList = (): Promise<Manager[]> => {
  return delay([...managers]);
};

export const getManagers = (): Promise<ManagerOption[]> => {
  return delay(managers.map(({ id, name }) => ({ id, name })));
};

export const createManager = (input: ManagerFormInput): Promise<Manager> => {
  const manager: Manager = { id: crypto.randomUUID(), ...input };
  managers = [manager, ...managers];
  return delay(manager);
};

export const updateManager = (
  id: string,
  input: ManagerFormInput,
): Promise<Manager> => {
  managers = managers.map((manager) =>
    manager.id === id ? { id, ...input } : manager,
  );

  return delay({ id, ...input });
};

export const deleteManager = (id: string): Promise<void> => {
  managers = managers.filter((manager) => manager.id !== id);
  return delay(undefined);
};
