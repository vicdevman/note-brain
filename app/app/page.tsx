import { auth } from "@/app/lib/auth"
import { redirect } from "next/navigation"
import NotesApp from "../components/NotesApp"

export default async function AppPage() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return <NotesApp />
}
