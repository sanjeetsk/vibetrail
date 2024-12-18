import { Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import { ToastContainer } from 'react-toastify';
import Dashboard from "./pages/Dashboard";
import 'react-toastify/dist/ReactToastify.css';
import CreatePost from "./components/CreatePost";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    <div className="App">
      <ToastContainer />
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/createPost" element={<CreatePost />} />
          <Route path="/profilePage" element={<ProfilePage />} />
        </Routes>
    </div>
  );
}

export default App;
