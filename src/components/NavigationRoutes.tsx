import { MainRoutes } from "@/lib/helpus";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router";

interface NavigationRoutesProps{
    isMobile? : boolean;
}

const NavigationRoutes = ({ isMobile = false} : NavigationRoutesProps) => {
  return (
  
    <ul className={cn("flex items-center gap-6" , isMobile && " items-start flex-col gap-8 ")}>
        {MainRoutes.map(route =>(
            <NavLink key={route.href} to={route.href} className={({isActive}) => cn("text-base text-neutral-600  " , isActive &&" font-semibold  text-neutral-900")}>

                {route.label}
            </NavLink>
        ))}
    </ul>
   
  )
}

export default NavigationRoutes
