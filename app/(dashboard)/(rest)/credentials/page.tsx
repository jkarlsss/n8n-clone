import { requireAuth } from "@/lib/auth-utils";
import { caller } from "../../../../trpc/server";

const Page = async () => {
  await requireAuth();

  const res = await caller.getCustomerState();
  
  console.log(res);

  return (
    <div>Credentials Page</div>
  )
}

export default Page