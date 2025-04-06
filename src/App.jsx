import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import DashboardDiet from "./DashboardDiet";
import CallConnect from "./callConnect";

function App() {
    return (
        <Router basename="/fcheckac">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard_diet" element={<DashboardDiet />} />
          <Route path="/callconnect/:callId/:name" element={<CallConnect />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    );
}

export default App;
