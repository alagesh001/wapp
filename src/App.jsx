import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import DashboardDiet from "./DashboardDiet";
import CallConnect from "./CallConnect";
import InstallPage from "./InstallPage";

function App() {
  // Helper function to check standalone mode
  const isRunningStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const [isStandalone, setIsStandalone] = useState(isRunningStandalone);

  useEffect(() => {
    setIsStandalone(isRunningStandalone);
  }, []);

  return (
    <Router basename="/fitoxconnect">
      <Routes>
        {/* Root route renders dynamically based on standalone mode */}
        <Route path="/" element={isStandalone ? <Login /> : <InstallPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard_diet" element={<DashboardDiet />} />
        <Route path="/callconnect/:id/:name" element={<CallConnect />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
