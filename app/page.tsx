import { Button } from "../components/ui/button"
import prisma from "../lib/prisma"

const page = async () => {

  const users = await prisma.user.findMany()
  console.log(users)

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center">
      <div className="flex flex-col gap-2">
        {users.map((user) => (
          <p key={user.id}>{user.email}</p>
        ))}
        </div>
      
      <Button variant="outline">Click me</Button>
    </div>
  )
}

export default page