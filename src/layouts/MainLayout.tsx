import ContainerPage from "@/components/containerPage";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Outlet } from "react-router-dom";


const MainLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* handler to store the user data */}
      <Header />

      <ContainerPage className="flex-grow">
       <main className="flex-grow ">
        <Outlet />
       </main>
      </ContainerPage>

      <Footer />
    </div>
  );
};

export default MainLayout;
