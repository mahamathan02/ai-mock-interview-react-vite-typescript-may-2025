import { db } from "@/config/firebase.config"
import LoaderPage from "@/routes/loaderpage"
import { User } from "@/types"
import { useAuth, useUser } from "@clerk/clerk-react"
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore"

import { useEffect } from "react"
import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const AuthHander = () =>{

    const { isSignedIn} = useAuth()
    const {user} = useUser()
    const pathname = useLocation().pathname;
    const navigate = useNavigate() 


    const [loading, setloading] = useState(false)

    useEffect(() =>{

      const storeUserData  = async() =>{

        if(isSignedIn && user ) {
            setloading(true);
            try{
                const userSanp = await getDoc(doc(db , "users" , user.id));
                if(!userSanp.exists()){

                    const userData : User ={
                        id : user.id,
                        name : user.fullName || user.firstName || "Anonymous" ,
                        email : user.primaryEmailAddress?.emailAddress || "N/A",
                        imageUrl : user.imageUrl ,
                        createdAt : serverTimestamp(),
                        updatedAt:  serverTimestamp()
                    }

                    await  setDoc(doc(db , "users" , user.id ) , userData)

                }



            } catch (error){
                console.log("error on stroing the user data" , error)

            }
            finally{
                setloading(false)
            }
        }

      }
      storeUserData()
    } ,[isSignedIn , user , pathname,navigate])

    if(loading) {
        return <LoaderPage />

    }
    return null
}

export default AuthHander