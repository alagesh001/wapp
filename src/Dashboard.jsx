import React from "react";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ImCheckmark,ImCart,ImUserCheck,ImHome} from "react-icons/im";
import QrScanner from "react-qr-scanner";

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Attendance");
    const [attendanceResponse, setAttendanceResponse] = useState("Scan QR to Mark");
    const [attendanceCount, setAttendanceCount] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

    const [scanResult, setScanResult] = useState(null);
    const [showScanner, setShowScanner] = useState(true); // Control scanner visibility
    const [markSuccess, setMarkSuccess] = useState(false); // Control scanner visibility
    const [meetingData, setMeetingData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [message, setMessage] = useState("");
    const goToWebrtc = () => {
      navigate(`/callconnect/${localStorage.getItem("userid")}/${encodeURIComponent("Expert Dietician")}`);
            }
  const handleScan = (data) => {
    if (data) {
                setShowScanner(false);

        setScanResult(data.text);
    }
};
useEffect(() => {
  if (scanResult !== null) {
  if (scanResult === "123xyz") {

      markAttendance();
  }else{
   // alert("❌ Wrong QR Code! Try again.");
    //setScanResult(null); // 🔄 Reset scan to restart
    setTimeout(() => {
      setAttendanceResponse("Wrong QR");
      
    }, 100);
       
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
    const mygender = localStorage.getItem("gender");
    const myuid = localStorage.getItem("userid");


    const user = {
      fullName: localStorage.getItem("name"),
      userId: myuid,
      password: "password123", // hidden by default
      logo: mygender === "Female"
      ? "https://oxadmedia.in/images/female_dp.jpg"
      : "https://oxadmedia.in/images/male_dp.jpg",
    };
    const handlePasswordUpdate = async () => {
      if (!oldPass || !newPass) {
        setMessage("Please enter both old and new passwords.");
        return;
      }
    
      try {
        const res = await fetch("https://oxadmedia.in/updateMemberDietPassword", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid: myuid,
            oldpass: oldPass,
            newpass: newPass,
            type: 1,
          }),
        });
    
        const data = await res.json();
    
        if (data.success) {
          localStorage.setItem("pass_key",newPass);

          setMessage("✅ Password updated successfully!");
          setEditing(false);
          setOldPass("");
          setNewPass("");
          
        } else {
          setMessage(`❌ ${data.message || "Update failed"}`);
        }
      } catch (error) {
        console.error("Update error:", error);
        setMessage("❌ Error while updating password.");
      }
    };
    const markAttendance = async () => {
      const payload = {
        userid: localStorage.getItem("userid"),
        id:localStorage.getItem("pass_key"),
    };
      setAttendanceResponse("Fetching...");
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
          setAttendanceCount(data.a_count);
          setMarkSuccess(true)
          setShowScanner(false);
        }
      } catch (error) {
        setAttendanceResponse("Failed to mark attendance. Try again.");
      }
    };
    const formatDateTime = (dateString) => {
      const date = new Date(dateString);
  
      // Format: 17 May 2025
      const formattedDate = date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
  
      // Format: Saturday
      const formattedDay = date.toLocaleDateString("en-US", { weekday: "long" });
  
      // Format: 04:02 PM
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
  
      return `${formattedDate}, ${formattedDay}, ${formattedTime}`;
    };
    const fetchProducts = async () => {
      setLoading(true);
    //  setError(null);
      const gymId = localStorage.getItem("gym_id");
      const payload = {
          gymid: gymId || null, // Set null if mobile is empty
       
        };
      try {
          console.log("Sending payload:", payload);
  
          const url = `https://oxadmedia.in/getmyproducts?gymid=${gymId}`;
  
          const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        console.log(" response:", data.result);
  
        if(data.success){
        //  setCurrentView("products");
        
        setProducts(data.result);
        }
      } catch (err) {
       // setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const checkDietSchedule = async () => {
      const payload = {
        userid: localStorage.getItem("userid"),
    };
      try {
        const response = await fetch("https://oxadmedia.in/checkdietschedule", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        const nomeetresponse = {
          success: false,
          message: "No Meeting scheduled",
          diet_schedule: "-",
        };
        const data = await response.json();
        if(data.success){
          setMeetingData(data);
        }else{
          setMeetingData(nomeetresponse);
        }
      } catch (error) {
        setMeetingData(nomeetresponse);

      }
    };
 
    return (
        <div className="relative w-full h-screen bg-white flex flex-col">
         
            {/* Page Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
      <div className="fixed top-0 left-0 w-full p-4 bg-black shadow-md flex justify-center">
  <h1 className="text-2xl text-white font-bold">{activeTab}</h1>
   {/* Logout Button */}
   <button
className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
onClick={handleLogout}
          >
            Logout
          </button>
    
</div>
{activeTab ==="Profile" &&(
 <div className="min-h-screen bg-white flex items-center justify-center px-4">
 <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg w-full max-w-3xl">
   <h2 className="text-center text-2xl font-semibold mb-6">Member Information</h2>

   <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
     <img
       src={user.logo}
       alt="Profile Logo"
       className="w-28 h-28 object-cover rounded-full border"
     />

     <div className="w-full">
       <div className="grid grid-cols-3 gap-4 text-gray-700 text-sm sm:text-base">
         <div className="font-medium">Full Name</div>
         <div className="col-span-2">{user.fullName}</div>

         <div className="font-medium">Member ID</div>
         <div className="col-span-2">{user.userId}</div>

         <div className="font-medium">Password</div>
         <div className="col-span-2">
           {editing ? (
             <div className="space-y-2">
               <input
                 type="password"
                 placeholder="Old Password"
                 className="w-full border rounded px-2 py-1"
                 value={oldPass}
                 onChange={(e) => setOldPass(e.target.value)}
               />
               <input
                 type="password"
                 placeholder="New Password"
                 className="w-full border rounded px-2 py-1"
                 value={newPass}
                 onChange={(e) => setNewPass(e.target.value)}
               />
               <div className="flex gap-2 mt-1">
                 <button
                   className="px-3 py-1 bg-green-600 text-white rounded"
                   onClick={handlePasswordUpdate}
                 >
                   Save
                 </button>
                 <button
                   className="px-3 py-1 bg-gray-300 rounded"
                   onClick={() => {
                     setEditing(false);
                     setOldPass("");
                     setNewPass("");
                     setMessage("");
                   }}
                 >
                   Cancel
                 </button>
               </div>
             </div>
           ) : (
             <div className="flex items-center gap-2">
               <span>•••••••••</span>
               <button
                 className="text-blue-600 hover:underline text-sm"
                 onClick={() => setEditing(true)}
               >
                 ✏️ Edit
               </button>
             </div>
           )}
         </div>

       </div>

       {message && <p className="text-sm mt-4 text-center text-red-600">{message}</p>}
     </div>
   </div>
 </div>
</div>
)}
{activeTab === "Dietician" && (
    <div className="bg-white shadow-lg rounded-lg p-6 w-80 text-center">
      {/* Show only when data is loaded */}
      {meetingData ? (
        <>
          <h2 className="text-lg font-semibold">Scheduled Meeting</h2>

          {/* Status */}
          <p className="text-gray-600 mt-1">
            Status:{" "}
            <span
              className={`font-medium ${
                meetingData.success ? "text-green-600" : "text-red-600"
              }`}
            >
              {meetingData.success ? "✅" : "❌"}
            </span>
          </p>

          {/* Meeting Details */}
          <div className="bg-blue-100 p-3 rounded-lg mt-4 text-left">
            <h3 className="text-blue-700 font-semibold">Meeting Details</h3>
            <p className="text-gray-700">
              <span className="font-medium">Message:</span> {meetingData.message}
            </p>
            {meetingData.success && (
              <p className="text-gray-700">
                <span className="font-medium">Diet Schedule:</span>{" "}
                {formatDateTime(meetingData.diet_schedule)}
              </p>
            )}
            
          </div>

          {/* Join Button */}
          <button 
          onClick={goToWebrtc}
          className="mt-4 bg-blue-700 text-white px-4 py-2 rounded-full hover:bg-blue-800 transition">
            Join
          </button>
        </>
      ) : (
        <p className="text-gray-500">Loading...</p>
      )}
    </div>
)}
        {activeTab === "Attendance" && (
         <div className="mt-4 flex flex-col items-center justify-center p-6">
            {/* QR Scanner */}
            {showScanner ? (
  <div className="w-64 bg-white p-2 rounded-lg shadow-md">
    <QrScanner
      delay={300}
      onScan={handleScan}
      onError={handleError}
      constraints={{
        video: { facingMode: "environment" }
      }}
      style={{ width: "100%",height:"100%"}}
    />
  </div>
) : (
  <div className="text-center">
  {attendanceCount && (
  <p className="mt-6 text-6xl font-extrabold text-blue-600 text-center">
    {attendanceCount}
  </p>
)}
    <p className="mt-4 text-lg font-semibold text-center
  ${markSuccess ? 'text-green-600' : 'text-red-600'}">
  {markSuccess ? "✅ Attendance Marked!" : "❌ Attendance Failed"}
</p>
   
    <button
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
      onClick={() => {setScanResult(null);
        setAttendanceResponse("Retrying..");
        setMarkSuccess(false);
        setShowScanner(true)}}
    >
      Scan Again
    </button>
    
  </div>
)}
       {/*  <button
           className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
           onClick={markAttendance}
         >
           Mark My Attendance
         </button>
       */}
        {attendanceResponse?.trim() && (
          <p className="mt-1 text-sm font-light text-gray-600 text-center">
          {attendanceResponse}
  </p>
)}
       </div>
        )}
{activeTab === "Products" && (
  <div className="bg-white py-10">
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-20 mb-20 mx-5 sm:mx-10 lg:mx-20 place-items-center">
      {products.map((product) => (
        <div
          key={product.productId}
          className="bg-white p-4 rounded-lg shadow-md text-center w-full max-w-[200px] md:max-w-[250px]"
        >
          <div className="w-full h-40 flex items-center justify-center">
            <img
              src={product.pic}
              alt={product["Product Name"]}
              className="max-h-full object-contain"
            />
          </div>
          <h3 className="text-lg font-semibold mt-2">
            {product["Product Name"]}
          </h3>
          <p className="text-sm text-gray-500">
            <s>₹{product.actualprice}</s>
          </p>
          <p className="text-lg font-bold text-blue-500">
            ₹{product.offerprice}
          </p>

          {/* Buy Now Button */}
          <button
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-200"
            onClick={() => handleBuyNow(product)} // define this function
          >
            Buy Now
          </button>
        </div>
      ))}
    </div>
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
  onClick={() => {
    fetchProducts(); 
    setActiveTab("Products");}}
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
  onClick={() =>{
    checkDietSchedule();
    setActiveTab("Dietician");}
  }
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