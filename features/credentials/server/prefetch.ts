import { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.credentials.getMany>;

/**
 * Prefetches all credentials 
 */

export const prefetchCredentials = (params: Input) => {
  return prefetch(trpc.credentials.getMany.queryOptions(params));
}

/**
 * Prefetches single credential
 */

export const prefetchCredential = (id: string) => {
  return prefetch(trpc.credentials.getOne.queryOptions({ id }));
}