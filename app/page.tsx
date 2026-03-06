
import { requireAuth } from "../lib/auth-utils"
import { caller } from "../trpc/server";
import Logout from "./logout";

const Page = async() => {

  await requireAuth();
  
  const user = await caller.getUser();


  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      Protected page
      {JSON.stringify(user, null, 2)}
      <Logout />
    </div>
  )
}

export default Page