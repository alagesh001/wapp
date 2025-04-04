import React from "react";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ImCheckmark,ImCart,ImUserCheck,ImHome} from "react-icons/im";

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Attendance");

    const handleLogout = () => {
        // Add your logout logic here (e.g., Firebase sign-out, remove token, etc.)
        console.log("User logged out");
        sessionStorage.clear();

        localStorage.clear();
        // Redirect to login page (optional)
        navigate("/login", { replace: true }); // Replace history entry   
           };
    useEffect(() => {
        if (!localStorage.getItem("userid")) {
            navigate("/login", { replace: true }); // Redirect to login if not authenticated
          }
      
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = () => {
            window.history.go(1); // Prevents back navigation
        };

        return () => {
            window.onpopstate = null; // Cleanup
        };
    }, []);
    return (
        <div className="relative w-full h-screen bg-gray-100 flex flex-col">
          {/* Logout Button */}
          <button
            className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
    
          {/* Page Content */}
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-2xl font-bold">Welcome to {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
    
          {/* Bottom Navigation Tabs */}
          <nav className="fixed bottom-0 left-0 w-full bg-white shadow-md flex justify-around py-3 border-t">
          <button
  className={`flex flex-col items-center ${
    activeTab === "Attendance" ? "text-orange-500 font-bold" : "text-gray-500"
  }`}
  onClick={() => setActiveTab("Attendance")}
>
  <ImCheckmark size={activeTab === "Attendance" ? 30 : 24} /> {/* Increase size if active */}
  <span className={`text-sm ${activeTab === "Attendance" ? "text-lg font-bold" : ""}`}>
  Attendance
  </span>
</button>
           
<button
  className={`flex flex-col items-center ${
    activeTab === "Products" ? "text-orange-500 font-bold" : "text-gray-500"
  }`}
  onClick={() => setActiveTab("Products")}
>
  <ImCart size={activeTab === "Products" ? 30 : 24} /> {/* Increase size if active */}
  <span className={`text-sm ${activeTab === "Products" ? "text-lg font-bold" : ""}`}>
  Products
  </span>
</button>
          
            <button
  className={`flex flex-col items-center ${
    activeTab === "Dietician" ? "text-orange-500 font-bold" : "text-gray-500"
  }`}
  onClick={() => setActiveTab("Dietician")}
>
  <ImUserCheck size={activeTab === "Dietician" ? 30 : 24} /> {/* Increase size if active */}
  <span className={`text-sm ${activeTab === "Dietician" ? "text-lg font-bold" : ""}`}>
    Dietician
  </span>
</button>
<button
  className={`flex flex-col items-center ${
    activeTab === "Profile" ? "text-orange-500 font-bold" : "text-gray-500"
  }`}
  onClick={() => setActiveTab("Profile")}
>
  <ImHome size={activeTab === "Profile" ? 30 : 24} /> {/* Increase size if active */}
  <span className={`text-sm ${activeTab === "Profile" ? "text-lg font-bold" : ""}`}>
  Profile
  </span>
</button>
          
          </nav>
        </div>
      );
    };


export default Dashboard;