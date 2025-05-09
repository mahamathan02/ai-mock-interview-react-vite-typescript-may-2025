import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/public-layout";
import HomePage from "./routes/home";
import AuthenticationLayout from "./layouts/auth-layout";

import SignInPage from "./routes/SignIn-page";
import SignUpPage from "./routes/SignUp-page";

import ProtectedLayout from "./layouts/ProtectedLayout"; 
import MainLayout from "./layouts/MainLayout";
import Generate from "./components/generate";
import Dashboard from "./routes/Dashboard";
import CreatEditPage from "./routes/CreatEditPage";
import MockLoadPage from "./routes/MockLoadPage";
import MockInterviwePage from "./routes/MockInterviwePage";
import FeedBack from "./routes/FeedBack";




const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Authentication layout */}
        <Route element={<AuthenticationLayout />}>
          <Route path="/signin/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedLayout><MainLayout /> 
        </ProtectedLayout>}>

        {/* add all the protected routes */}

        <Route element={<Generate />} path="/generate">
          <Route index element= {<Dashboard />}/>
          <Route path=":interviewId" element={<CreatEditPage />} />
          <Route path="interview/:interviewId" element={<MockLoadPage />} />
          <Route path="interview/:interviewId/start" element={<MockInterviwePage />} />
          <Route path="feedback/:interviewId" element={<FeedBack />} />


        </Route>
        

         
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
