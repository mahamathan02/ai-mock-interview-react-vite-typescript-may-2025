import { cn } from '@/lib/utils'
import  { Loader2 } from "lucide-react"

const LoaderPage = ( {className} : {className ? : string}) => {
  return (
    <div className={cn("w-screen h-screen flex items-center justify-center bg-transparent z-50" ,className)}>
     <Loader2 className=' w-6 h-6 min-h-6 animate-spin' />
    </div>
  )
}

export default LoaderPage
