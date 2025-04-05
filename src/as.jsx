import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [currentView, setCurrentView] = useState(null);
  const [attendanceNumber, setAttendanceNumber] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [textToShow, setTextToShow] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const goToWebrtc = async () => {
    navigate("/callconnect");
  }
    const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    const gymId = localStorage.getItem("gymId");
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
        setCurrentView("products");
      
      setProducts(data.result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleMarkAttendance = async () => {
    setLoading(true);
    setError(null);
    const uid = localStorage.getItem("user_id");
    const p_key = localStorage.getItem("pass_key");
    const payload = {
        userid: uid || null, // Set null if mobile is empty
        id: p_key || null, // Set null if ID is empty
      };
    try {
        console.log("Sending payload:", payload);

      const response = await fetch("https://oxadmedia.in/markAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to mark attendance");
      }
      setCurrentView("attendance");
      setTextToShow(data.message || "");
      setAttendanceNumber(data.a_count || "N/A"); // Store the number from API
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: "#f3f4f6",
      }}
    >
      {/* Main Content */}
      <div style={{ padding: "20px",  marginBottom: "80px" }}>
        {currentView === "attendance" && attendanceNumber && (
          <div style={{ textAlign: "center", padding: "20px" }}>
          <h2 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", marginBottom: "10px", color: "#383838" }}>Fit Ox - Connect</h2>
      
      
            {error && <p style={{ color: "red" }}>{error}</p>}
      
            {/* Display Number Above Button */}
            {attendanceNumber !== null && (
        <div style={{marginBottom: "10px" }}>
          <h1 style={{ color: "green", fontSize: "45px" }}>{attendanceNumber}</h1>
          <div style={{ color: "black", fontSize: "14px" }}> {textToShow}</div>
      
        </div>
        )}
  </div>
        )}
        {currentView === "products" && products.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
            }}
          >
            {products.map((product) => (
              <div
                key={product.productId}
                style={{
                  backgroundColor: "#fff",
                  padding: "15px",
                
                  borderRadius: "10px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  textAlign: "center",
                }}
              >
                <img
                  src={product.pic}
                  alt={product["Product Name"]}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                <h3 style={{ fontSize: "18px", margin: "10px 0" }}>
                  {product["Product Name"]}
                </h3>
                <p style={{ fontSize: "16px", color: "gray" }}>
                  Actual Price: <s>₹{product.actualprice}</s>
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#3b82f6",
                  }}
                >
                  Offer Price: ₹{product.offerprice}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Menu */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          position: "fixed",
          bottom: 0,

          width: "100%",
          height: "80px",
          backgroundColor: "#ffffff",
          boxShadow: "0 -2px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <button
          onClick={handleMarkAttendance}
          style={{
            padding: "10px 10px",
            fontSize: "16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "20px",
            marginLeft: "10px",
            marginRight: "10px",
            marginTop: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
          disabled={loading}
        >Mark Attendance
        {/*   {loading && currentView === "attendance"
            ? "Marking..."
            : "Mark Attendance"} */}
        </button>
        <button
          onClick={fetchProducts}
          style={{
            padding: "10px 10px",
            fontSize: "16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "20px",
            marginLeft: "10px",
            marginRight: "10px",
             marginTop: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
          disabled={loading}
        >Our Products
           {/*  {loading && currentView === "products"
            ? "Loading..."
            : "Show Products"} */}
        </button>
        <button
          onClick={goToWebrtc}
          style={{
            padding: "10px 10px",
            fontSize: "16px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "20px",
            marginLeft: "10px",
            marginRight: "10px",
            marginTop: "10px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
          disabled={loading}
        >Dietician Connect
           {/*  {loading && currentView === "products"
            ? "Loading..."
            : "Show Products"} */}
        </button>
      </div>
    </div>
  );
}
