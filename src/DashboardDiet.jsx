import React from "react";
import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { ImCheckmark,ImCart,ImUserCheck,ImHome} from "react-icons/im";
import QrScanner from "react-qr-scanner";

function DashboardDiet() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Profile");
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
    const [calls, setCalls] = useState([]);
    const mygender = localStorage.getItem("gender");
    const myuid = localStorage.getItem("userid");
    const mygymid = localStorage.getItem("gym_id");
    const goToWebrtc = (callIdIs,name) => {
      console.log("CCC Generated Call ID:", callIdIs);

      navigate(`/callconnect/${callIdIs}/${encodeURIComponent(name)}`);
    }
    const fetchDietCalls = async() => {
        try {
            console.log(" AA response:", mygymid);

            const url = `https://oxadmedia.in/getdietschedule?gymid=${mygymid}`;
    
            const response = await fetch(url, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const data = await response.json();
          console.log(" response:", data.result);
    
          if(data.success){
          //  setCurrentView("products");

          setCalls(data.result);
        }else{
            setCalls([]);

        }
        } catch (err) {
            setCalls([]);

         // setError(err.message);
        } finally {
         // setLoading(false);
        }
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
            type: 2,
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
    const formatDate = (dateStr) => {
        const dateObj = new Date(dateStr);
      
        const date = dateObj.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      
        const day = dateObj.toLocaleDateString("en-IN", {
          weekday: "long",
        });
      
        const time = dateObj.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      
        return { date, day, time };
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
{activeTab === "Dietician" && (
  <div className="min-h-screen bg-white py-10 px-4 w-full max-w-4xl mx-auto">

    {/* Latest 10 Schedules Heading */}
<h3 className="text-center text-xl font-bold mt-15 mb-6">Latest 10 Schedules</h3>

  

    <div className="space-y-4 max-w-2xl mx-auto">
      {calls.map((call) => {
        const { date, day, time } = formatDate(call.diet_schedule); // ✅ Add this here

        return (
          <div
            key={call.userid}
            className="flex items-center justify-between bg-blue-100 rounded-xl shadow-md p-4"
          >
            <div>
              <h3 className="text-base font-semibold text-gray-800">{call.name}</h3>
              <p className="text-sm text-gray-700">{date}</p>
              <p className="text-sm text-gray-500">{day}</p>
              <p className="text-sm text-gray-500">{time}</p>
            </div>

            {/* Uncomment to enable Start button */}
            {/* <button 
              onClick={() => goToWebrtc(call.userid, call.name)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-blue-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.36 11.36 0 003.55.57 1 1 0 011 1v3.61a1 1 0 01-1 1A16 16 0 013 5a1 1 0 011-1h3.6a1 1 0 011 1 11.36 11.36 0 00.57 3.55 1 1 0 01-.21 1.11l-2.34 2.13z" />
              </svg>
              Start
            </button> */}
          </div>
        );
      })}
    </div>
  </div>
)}


     
{activeTab ==="Profile" &&(
 <div className="min-h-screen bg-white flex items-center justify-center px-4">
 <div className="bg-white p-6 md:p-10 rounded-lg shadow-lg w-full max-w-3xl">
   <h2 className="text-center text-2xl font-semibold mb-6">Dietician Information</h2>

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

         <div className="font-medium">Dietician ID</div>
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
    fetchDietCalls();
    setActiveTab("Dietician");}
  }
>
  <ImUserCheck size={activeTab === "Dietician" ? 30 : 24} /> {/* Increase size if active */}
  <span className={`text-sm ${activeTab === "Dietician" ? "text-lg font-bold" : ""}`}>
  Schedules
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


export default DashboardDiet;