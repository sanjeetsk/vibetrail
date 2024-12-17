import { Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import { ToastContainer } from 'react-toastify';
import Dashboard from "./pages/Dashboard";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <ToastContainer />
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    </div>
  );
}

export default App;
