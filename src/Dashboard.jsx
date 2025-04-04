import React from "react";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ImCheckmark,ImCart,ImUserCheck,ImHome} from "react-icons/im";
import QrScanner from "react-qr-scanner";

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Attendance");
    const [attendanceResponse, setAttendanceResponse] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [showScanner, setShowScanner] = useState(true); // Control scanner visibility

    const payload = {
      userid: localStorage.getItem("userid"),
      id:localStorage.getItem("pass_key"),
  };
  const handleScan = (data) => {
    if (data) {
        setScanResult(data.text);
    }
};
useEffect(() => {
  if (scanResult !== null) {
  if (scanResult === "123xyz") {

      markAttendance();
  }else{
    alert("❌ Wrong QR Code! Try again.");
    setScanResult(null); // 🔄 Reset scan to restart

  }
}
}, [scanResult]);
const handleError = (err) => {
    console.error("QR Scanner Error:", err);
};

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
    const markAttendance = async () => {
      try {
        const response = await fetch("https://oxadmedia.in/markAttendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
  
        const data = await response.json();
        setAttendanceResponse(data.message);
        if(data.success){
          setShowScanner(false);
        }
      } catch (error) {
        setAttendanceResponse("Failed to mark attendance. Try again.");
      }
    };
    return (
        <div className="relative w-full h-screen bg-gray-100 flex flex-col">
         
            {/* Page Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
      <div className="fixed top-0 left-0 w-full p-4 bg-white shadow-md flex justify-center">
  <h1 className="text-2xl font-bold">{activeTab}</h1>
   {/* Logout Button */}
   <button
className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
onClick={handleLogout}
          >
            Logout
          </button>
    
</div>
        {activeTab === "Attendance" && (
         <div className="mt-4 flex flex-col items-center justify-center p-6">
            {/* QR Scanner */}
            {showScanner ? (
                <div className="w-64 h-64 bg-white p-2 rounded-lg shadow-md">
                    <QrScanner
                        delay={300}
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            video: { facingMode: "environment" } // Use back camera
                        }}
                        style={{ width: "100%" }}
                    />
                </div>
            ) : (
                <p className="mt-4 text-lg font-semibold text-green-600">
                    ✅ Attendance Marked!
                </p>
            )}
       {/*  <button
           className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
           onClick={markAttendance}
         >
           Mark My Attendance
         </button>
       */}
         {attendanceResponse && (
           <p className="mt-3 text-lg font-semibold text-green-600 text-center">
             {attendanceResponse}
           </p>
         )}
       </div>
        )}
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