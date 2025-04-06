import { useState } from "react";
import { FaUser, FaUserMd } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect } from "react";

function Login() {
    const [activeTab, setActiveTab] = useState("members");
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate(); // React Router hook for navigation
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
  
    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
          e.preventDefault(); // Prevent the automatic prompt
          setDeferredPrompt(e);
          setShowInstall(true); // Show the install button
        };
    
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
        return () => {
          window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
      }, []);
  
    const handleInstallClick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      }
    };
    useEffect(() => {
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = () => {
            window.history.go(1); // Prevents back navigation
        };

        return () => {
            window.onpopstate = null; // Cleanup
        };
    }, []);
    const handleLogin = async () => {
      setError("");
      setSuccessMessage("");

      if (!userId.trim() || !password.trim()) {
          setError("User ID and Password are required.");
          return;
      }

      setLoading(true);
      const payload = {
        userid: userId,
        id:password,
        type: activeTab === "members" ? 1 : 2, // Type 1 for Users, 2 for Dietitians
    };

      try {
          const response = await fetch("https://oxadmedia.in/loginAttend", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (data.success) {
              setSuccessMessage(data.message);
              localStorage.setItem("userid", data.message.userid); // Store token for authentication
              localStorage.setItem("name", data.message.name);
              localStorage.setItem("gym_id", data.message.gym_id);
              localStorage.setItem("pass_key",password);
              localStorage.setItem("gender",data.message.gender);
              localStorage.setItem("type",data.type);

              console.log("Login successful:", data);
              if(data.type == 1){
                navigate("/dashboard"); // Redirect to Dashboard

              }else{
                navigate("/dashboard_diet"); // Redirect to Dashboard

              }
                   } else {
              setError(data.message || "Login failed.");
          }
      } catch (err) {
          setError("Something went wrong. Please try again.");
      } finally {
          setLoading(false);
      }
  };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
            <div className="w-full max-w-xl p-12 bg-white rounded-2xl shadow-xl text-center">
            {showInstallButton && (
        <button
          onClick={handleInstallClick}
          className="mt-6 mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
          >
          Install App
        </button>
      )}
                <h2 className="text-2xl font-bold text-gray-800">Welcome to Fitness Portal</h2>
                <p className="text-gray-600 mt-2">Are you a User or a Dietitian? Please select your role to continue.</p>

                {/* Role Selection */}
                <div className="flex justify-center mt-6 space-x-4">
                    <button 
                        className={`flex items-center px-4 py-2 text-white rounded-lg text-lg font-medium transition ${activeTab === 'members' ? 'bg-green-600' : 'bg-gray-300'}`}
                        onClick={() => setActiveTab("members")}
                    >
                        <FaUser className="mr-2" /> Member
                    </button>
                    <button 
                        className={`flex items-center px-4 py-2 text-white rounded-lg text-lg font-medium transition ${activeTab === 'dietician' ? 'bg-red-600' : 'bg-gray-300'}`}
                        onClick={() => setActiveTab("dietician")}
                    >
                        <FaUserMd className="mr-2" /> Dietitian
                    </button>
                </div>

                {/* Login Form */}
                <div className="mt-6">
                    <input 
                        type="text"
                        placeholder="User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 mt-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Error Message */}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    {/* Login Button */}
                    <button 
                        onClick={handleLogin}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Login
                    </button>
                </div>

                <p className="text-gray-500 text-sm mt-4">Selecting a role will help us personalize your experience.</p>
            </div>
        </div>
    );
}

export default Login;
