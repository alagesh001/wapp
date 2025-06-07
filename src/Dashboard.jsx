import React from "react";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ImCheckmark,ImCart,ImUserCheck,ImHome} from "react-icons/im";
import QrScanner from "react-qr-scanner";
import { GiWeightLiftingUp } from "react-icons/gi";

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Attendance");
    const [attendanceResponse, setAttendanceResponse] = useState("Scan QR to Mark");
    const [attendanceCount, setAttendanceCount] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [admin_contactIs, setAdminCont] = useState("");

    const [scanResult, setScanResult] = useState(null);
    const [showScanner, setShowScanner] = useState(true); // Control scanner visibility
    const [markSuccess, setMarkSuccess] = useState(false); // Control scanner visibility
    const [meetingData, setMeetingData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [message, setMessage] = useState("");
    const [broadmessage, setBroadMessage] = useState("");
  const weeklyPlan = [
    {
      day: "Day 1 - Chest and Triceps",
      exercises: [
        { name: "Flat Bench Press", sets: 4, reps: "8-12" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
        { name: "Cable Chest Fly", sets: 3, reps: "12-15" },
        { name: "Tricep Pushdowns", sets: 4, reps: "10-12" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12-15" },
      ],
    },
    {
      day: "Day 2 - Back and Biceps",
      exercises: [
        { name: "Deadlifts", sets: 4, reps: "6-8" },
        { name: "Pull-Ups", sets: 4, reps: "8-12" },
        { name: "Bent-Over Rows", sets: 4, reps: "10-12" },
        { name: "Barbell Bicep Curls", sets: 3, reps: "10-12" },
        { name: "Hammer Curls", sets: 3, reps: "12-15" },
      ],
    },
    {
      day: "Day 3 - Legs",
      exercises: [
        { name: "Squats", sets: 4, reps: "8-10" },
        { name: "Leg Press", sets: 4, reps: "10-12" },
        { name: "Romanian Deadlifts", sets: 3, reps: "10-12" },
        { name: "Walking Lunges", sets: 3, reps: "12/leg" },
        { name: "Standing Calf Raises", sets: 4, reps: "15-20" },
      ],
    },
    {
      day: "Day 4 - Shoulders",
      exercises: [
        { name: "Overhead Barbell Press", sets: 4, reps: "8-10" },
        { name: "Lateral Raises", sets: 3, reps: "12-15" },
        { name: "Front Raises", sets: 3, reps: "12-15" },
        { name: "Face Pulls", sets: 4, reps: "12-15" },
        { name: "Dumbbell Shrugs", sets: 3, reps: "15-20" },
      ],
    },
    {
      day: "Day 5 - Functional Training",
      exercises: [
        { name: "Kettlebell Swings", sets: 3, reps: "15-20" },
        { name: "Battle Ropes", sets: 3, reps: "30 seconds" },
        { name: "Burpees", sets: 3, reps: "15" },
        { name: "Medicine Ball Slams", sets: 3, reps: "12" },
      ],
    },
    {
      day: "Day 6 - Cardio & Core",
      exercises: [
        { name: "Running (Treadmill)", sets: 1, reps: "20-30 minutes" },
        { name: "Plank", sets: 3, reps: "60 seconds" },
        { name: "Russian Twists", sets: 3, reps: "15/side" },
        { name: "Bicycle Crunches", sets: 3, reps: "12-15" },
      ],
    },
    {
      day: "Day 7 - Rest",
      exercises: ["Rest and recovery. Foam rolling and stretching."],
    },
  ];
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          // Page went to background
          setShowScanner(false);
        } else if (document.visibilityState === "visible") {
          setShowScanner(true);
          // Optional: restartCamera();
        }
      };
    
      document.addEventListener("visibilitychange", handleVisibilityChange);
    
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, []);
       const fetchb_message = async () => {
        setBroadMessage("Loading...");
        setLoading(true);
      //  setError(null);
        const gymId = localStorage.getItem("gym_id");
        const payload = {
            gymid: gymId || null, // Set null if mobile is empty
         
          };
        try {
            //console.log("Sending payload:", payload);
    
            const url = `https://oxadmedia.in/getb_message?gymid=${gymId}`;
    
            const response = await fetch(url, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
          if (!response.ok) {
           // throw new Error("Failed to fetch message");
          }
          const data = await response.json();
    
          if(data.success){
setBroadMessage(data.result.broad_msg);
setAdminCont(data.result.admin_contact ? String(data.result.admin_contact) : "null");

          //  setCurrentView("products");
          
         
          }
        } catch (err) {
         // setError(err.message);
        } finally {
        }
      };
    useEffect(() => {
      // This runs on page load or refresh
   
     
  
      fetchb_message();
    }, []);
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
  if (scanResult === "ncrtocDP2N") {

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
    const rDate = localStorage.getItem("rDate");


    const user = {
      fullName: localStorage.getItem("name"),
      userId: myuid,
        rDate: rDate, // hi
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
      setAttendanceResponse("Marking...");
  try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const response = await fetch("https://oxadmedia.in/markAttendance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  const data = await response.json();
  setAttendanceResponse(data.message);
  if (data.success) {
    setAttendanceCount(data.a_count);
    setMarkSuccess(true);
    setShowScanner(false);
  }
} catch (error) {
      setAttendanceResponse("Failed to mark attendance. Check your internet connection.");

  // if (error.name === "AbortError") {
  //   setAttendanceResponse("Request timed out. Please try again.");
  // } else {
  //   setAttendanceResponse("Failed to mark attendance. Check your internet connection.");
  // }
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
         // console.log("Sending payload:", payload);
  
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


  const openWhatsApp = (Pname, Pid) => {
    const phoneNumber = '91'+admin_contactIs;
    const myuid = localStorage.getItem("userid");
    const fullName = localStorage.getItem("name");
  const whatsappMessage = `Hello, Name : ${fullName} (Client Id: ${myuid}). I want to buy ${Pname} (Product Id: ${Pid}) .`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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
 <div className="font-medium">Expiry Date</div>
         <div className="col-span-2">{user.rDate}</div>
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
          {/* <button 
          onClick={goToWebrtc}
          className="mt-4 bg-green-700 text-white px-4 py-2 rounded-full hover:bg-blue-800 transition">
            Join
          </button> */}
        </>
      ) : (
        <p className="text-gray-500">Loading...</p>
      )}
    </div>
)}
        {activeTab === "Attendance" && (
         <div className="mt-4 flex flex-col items-center justify-center p-6">
<div className="absolute top-20 left-0 w-full text-center px-4">
{broadmessage?.trim() && (
  <h3 className="text-gray-800 font-semibold text-lg bg-gray-200/80 backdrop-blur-md py-3 px-5 rounded-xl shadow-sm text-center border border-gray-300">
  📣 <span className="text-blue-600">From GYM:</span> {broadmessage}
</h3>
)}
      </div>
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
  {markSuccess ? "✅ Attendance Marked!" : ""}
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
        key={product.id}
        className="bg-white p-4 rounded-lg shadow-md text-center w-full max-w-[200px] md:max-w-[250px]"
      >
        <div className="w-full h-40 flex items-center justify-center">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="max-h-full object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold mt-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500">
          <s>₹{product.actualPrice}</s>
        </p>
        <p className="text-lg font-bold text-blue-500">
          ₹{product.offerPrice}
        </p>
          {/* Buy Now Button */}
          <button
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-200"
            onClick={() => openWhatsApp(product.name,product.id)} // define this function
          >
            Buy Now
          </button>
        </div>
      ))}
    </div>
  </div>
)}
{activeTab === "Workouts" && (
  <div className="bg-white py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Weekly Gym Workout Plan
        </h1>
        {weeklyPlan.map((day, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {day.day}
            </h2>
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-blue-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Exercise
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Sets
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-center">
                    Reps
                  </th>
                </tr>
              </thead>
              <tbody>
                {day.exercises.map((exercise, i) =>
                  typeof exercise === "string" ? (
                    <tr key={i}>
                      <td
                        colSpan="3"
                        className="border border-gray-300 px-4 py-2 italic text-center text-gray-600"
                      >
                        {exercise}
                      </td>
                    </tr>
                  ) : (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">
                        {exercise.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {exercise.sets}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {exercise.reps}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
)}
      </div>
    
          {/* Bottom Navigation Tabs */}
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-md py-3 border-t">
  <div className="flex justify-around">
    {/* Attendance */}
    <button
      className={`flex flex-col items-center ${
        activeTab === "Attendance" ? "text-orange-500 font-bold" : "text-gray-500"
      }`}
      onClick={() => {
        fetchb_message();
        setActiveTab("Attendance");
      }}
    >
      <ImCheckmark size={activeTab === "Attendance" ? 24 : 20} />
      <span
        className={`text-xs ${
          activeTab === "Attendance" ? "font-bold" : ""
        }`}
      >
        Attendance
      </span>
    </button>

    {/* Products */}
    <button
      className={`flex flex-col items-center ${
        activeTab === "Products" ? "text-orange-500 font-bold" : "text-gray-500"
      }`}
      onClick={() => {
        fetchProducts();
        setActiveTab("Products");
      }}
    >
      <ImCart size={activeTab === "Products" ? 24 : 20} />
      <span
        className={`text-xs ${
          activeTab === "Products" ? "font-bold" : ""
        }`}
      >
        Products
      </span>
    </button>

    {/* Dietician */}
    <button
      className={`flex flex-col items-center ${
        activeTab === "Dietician" ? "text-orange-500 font-bold" : "text-gray-500"
      }`}
      onClick={() => {
        checkDietSchedule();
        setActiveTab("Dietician");
      }}
    >
      <ImUserCheck size={activeTab === "Dietician" ? 24 : 20} />
      <span
        className={`text-xs ${
          activeTab === "Dietician" ? "font-bold" : ""
        }`}
      >
        Dietician
      </span>
    </button>

    {/* Workouts */}
    <button
      className={`flex flex-col items-center ${
        activeTab === "Workouts" ? "text-orange-500 font-bold" : "text-gray-500"
      }`}
      onClick={() => setActiveTab("Workouts")}
    >
      <GiWeightLiftingUp size={activeTab === "Workouts" ? 24 : 20} />
      <span
        className={`text-xs ${
          activeTab === "Workouts" ? "font-bold" : ""
        }`}
      >
        Workout
      </span>
    </button>

    {/* Profile */}
    <button
      className={`flex flex-col items-center ${
        activeTab === "Profile" ? "text-orange-500 font-bold" : "text-gray-500"
      }`}
      onClick={() => setActiveTab("Profile")}
    >
      <ImHome size={activeTab === "Profile" ? 24 : 20} />
      <span
        className={`text-xs ${
          activeTab === "Profile" ? "font-bold" : ""
        }`}
      >
        Profile
      </span>
    </button>
  </div>
</nav>

        </div>
      );
    };


export default Dashboard;