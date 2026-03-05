"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "../trpc/client";

const Client = () => {

  const trpc = useTRPC();
  const { data : users } = useSuspenseQuery(trpc.getUser.queryOptions());
  
  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    <div>CLient component {JSON.stringify(users, null, 2)}</div>
    </div>
  )
}

export default Client