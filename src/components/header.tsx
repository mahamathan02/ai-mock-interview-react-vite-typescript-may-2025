import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import ContainerPage from "./containerPage";
import LogoContainer from "./LogoContainer";
import NavigationRoutes from "./NavigationRoutes";
import { NavLink } from "react-router-dom";
import ProfileConatiner from "./ProfileConatiner";
import ToggleConatiner from "./ToggleConatiner";

const Header = () => {
  const { userId } = useAuth();

  return (
    <header className={cn("w-full border-b duration-150 transition-all ease-in-out")}>
      <ContainerPage className="">
        <div className="flex items-center gap-4 w-full">
          {/* Logo section */}

          <LogoContainer />

          {/* Navigation section */}
          <nav className=" hidden md:flex items-center gap-3">

         <NavigationRoutes />
         {userId && (
           <NavLink  to={"/generate"} className={({isActive}) => cn("text-base text-neutral-600  " , isActive &&" font-semibold  text-neutral-900")}>

          Take An interview
       </NavLink>
         )}

         </nav>

          {/* Profile section */}

          <div className=" flex items-center gap-6 ml-auto ">
           {/* Profile section */}

           <ProfileConatiner />

           {/* mobile togle section */}
           <ToggleConatiner />

          </div>
        </div>
      </ContainerPage>
    </header>
  );
};

export default Header;
