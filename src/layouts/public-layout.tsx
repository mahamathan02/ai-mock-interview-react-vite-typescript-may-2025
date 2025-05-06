
import { Footer } from "@/components/footer"
import Header from "@/components/header"
import AuthHander from "@/handlers/AuthHander"
import { Outlet } from "react-router-dom"


const PublicLayout = () => {
  return (
    <div className="w-full">
      {/* handler to store the user data */}

      <AuthHander />
      <Header />

      <Outlet />

      <Footer />
       
    </div>
  )
}

export default PublicLayout
