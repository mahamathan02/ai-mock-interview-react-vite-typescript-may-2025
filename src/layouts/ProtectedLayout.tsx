import LoaderPage from "@/routes/loaderpage"
import { useAuth } from "@clerk/clerk-react"
import { Navigate } from "react-router-dom"


const protectedLayout= ({children} : { children: React.ReactNode}) => {
    const { isLoaded ,isSignedIn} = useAuth()

    if(!isLoaded) {
        return <LoaderPage />
    }

    if(!isSignedIn){
        <Navigate  to={"/signin/*"} replace/>
    }






  return (
    children
  )
}

export default protectedLayout
