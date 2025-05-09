import Heading from "@/components/heading"
import InterviewPin from "@/components/pin"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { db } from "@/config/firebase.config"
import { Interview } from "@/types"
import { useAuth } from "@clerk/clerk-react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { Plus } from "lucide-react"

import { useEffect, useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"

const Dashboard = () => {
  const [loading, setLoading] = useState(false)
  const [interview, setInterview] = useState<Interview[]>([])
  const { userId } = useAuth()

  useEffect(() => {
    if (!userId) return

    setLoading(true)
    const interviewQuery = query(
      collection(db, "interview"),
      where("userId", "==", userId)
    )

    const unsubscribe = onSnapshot(
      interviewQuery,
      (snapshot) => {
        const interviewList: Interview[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[]
        setInterview(interviewList)
        setLoading(false)
      },
      (error) => {
        console.error("Error on fetching:", error)
        toast.error("Error", {
          description: "Something went wrong... try again later...",
        })
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  return (
    <div className="w-full min-h-screen px-4 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Dashboard"
          description="Create and start your AI Mock Interview"
        />
        <Link to="/generate/create">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add New
          </Button>
        </Link>
      </div>

      <Separator className="my-8" />

      <div className="grid md:grid-cols-3 gap-3 py-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 md:h-32 rounded-md" />
          ))
        ) : interview.length > 0 ? (
          interview.map((item) => (
            <InterviewPin key={item.id} interview={item} />
          ))
        ) : (
          <div className="md:col-span-3 w-full flex flex-col items-center justify-center h-96 text-center">
            <img
              src="/svg/not-found.svg"
              className="w-44 h-44 object-contain mb-4"
              alt="No Data"
            />
            <h2 className="text-lg font-semibold text-muted-foreground">
              No Data Found
            </h2>
            <p className="w-full max-w-md text-sm text-neutral-400 mt-2">
              There is no available data to show. Please add some new mock
              interviews.
            </p>
            <Link to="/generate/create" className="mt-4">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
