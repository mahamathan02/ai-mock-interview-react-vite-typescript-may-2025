import { cn } from "@/lib/utils"

interface containerProps {
    children: React.ReactNode,
    className : string
}

const ContainerPage = ( {children,className} : containerProps) => {
  return (
    <div className={cn ("mx-auto px-4 md:px-8 py-8 container w-full",className)}>
        {children}
        
      
    </div>
  )
}

export default ContainerPage
