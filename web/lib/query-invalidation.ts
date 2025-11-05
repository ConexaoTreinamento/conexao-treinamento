import type { QueryClient } from "@tanstack/react-query";

type QueryKeyRoot = {
  _id?: string;
  path?: { sessionId?: string };
};

const isObjectWithId = (value: unknown): value is QueryKeyRoot =>
  typeof value === "object" && value !== null;

const hasQueryId = (value: unknown, id: string) =>
  isObjectWithId(value) && value._id === id;

export const invalidateReportsQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    predicate: (query) => {
      const [root] = query.queryKey as unknown[];
      return hasQueryId(root, "getReports");
    },
  });

export const invalidateStudentsList = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    predicate: (query) => {
      const [root] = query.queryKey as unknown[];
      return hasQueryId(root, "findAllStudents");
    },
  });

export const isSessionDetailQuery = (
  root: unknown,
  sessionId: string,
): boolean =>
  isObjectWithId(root) && root._id === "getSession" && root.path?.sessionId === sessionId;

export const toLocalDateIso = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
