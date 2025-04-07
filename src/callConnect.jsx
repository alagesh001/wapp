import React, { useEffect,useState, useRef } from "react";
import { getDatabase, ref, set, push, onValue,remove,off } from "firebase/database";
import { initializeApp } from "firebase/app";
import { useNavigate,useParams  } from "react-router-dom";

// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBRzqsWSg_ljYFhSoa6lfVHQlFgbQiYTTM",
  authDomain: "wbrtcfitox.firebaseapp.com",
  databaseURL: "https://wbrtcfitox-default-rtdb.asia-southeast1.firebasedatabase.app/",

  projectId: "wbrtcfitox",
  storageBucket: "wbrtcfitox.firebasestorage.app",
  messagingSenderId: "704402530419",
  appId: "1:704402530419:web:c2ba224361e225ce064a06",
  measurementId: "G-X2LR0HB3CV"
};
// Initialize Firebase
initializeApp(firebaseConfig);
const db = getDatabase();

export default function CallConnect() {
  const wakeLock = useRef(null);

  const { id, name } = useParams();

  const decodedName = decodeURIComponent(name);
  const callId = id;

    const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [isremoteConnected, setIsRemoteConnected] = useState(false);

  const navigate = useNavigate();
  const typeRole = localStorage.getItem("type");
  const [isMember, setIsMember] = useState(true);
  const [callDuration, setCallDuration] = useState("00:00");
const [startTime, setStartTime] = useState(null);
useEffect(() => {
  let interval;
  if (isremoteConnected) {
    setStartTime(Date.now());
    interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const minutes = Math.floor(elapsed / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
      setCallDuration(`${minutes}:${seconds}`);
    }, 1000);
  }

  return () => clearInterval(interval);
}, [isremoteConnected, startTime]);


  useEffect(() => {
    return () => {
      if (typeRole == 1) {
        off(ref(db, `calls/${callId}`)); // removes all listeners on that ref
        off(ref(db, `calls/${callId}/callerCandidate`)); // same here     
         } else if (typeRole == 2) {
          off(ref(db, `calls/${callId}/answer`)); // removes all listeners on that ref
          off(ref(db, `calls/${callId}/calleeCandidate`)); // same here     

      }
    
    };
  }, []);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock.current = await navigator.wakeLock.request('screen');
          console.log("Wake lock activated ✅");

          // Handle when the wake lock is released (e.g., user switches tabs)
          wakeLock.current.addEventListener('release', () => {
            console.log("Wake lock was released ❌");
          });
        }
      } catch (err) {
        console.error(`Wake lock error: ${err.name}, ${err.message}`);
      }
    };
    requestWakeLock();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        requestWakeLock();
      }
    });
    return () => {
      if (wakeLock.current) {
        wakeLock.current.release();
        wakeLock.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (typeRole == 1) {
      setIsMember(true);
    } else if (typeRole == 2) {
      setIsMember(false);
    }
  }, []);
let pc;
  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(servers);
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };
    pc.onicecandidate = event => {
          if (event.candidate && event.candidate.candidate) {
              console.log("New ICE candidate:", event.candidate);
              const postsRef = ref(db, `calls/${callId}/callerCandidate`);
              const candidateType = event.candidate.sdpMLineIndex === 0 ? "audio" : "video";
  
              
  
  push(postsRef, {
  candidate: event.candidate.candidate,
  sdpMid: event.candidate.sdpMLineIndex,
  sdpMLineIndex: event.candidate.sdpMLineIndex
  }).then(() => {
  console.log('New post added');
  }).catch((error) => {
  console.error('Error pushing data:', error);
  });
              
          }
         
      };
    return pc;
  };

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const retryConnection = () => {
    
      const pc = peerConnectionRef.current;
  
      console.log("PeerConnection B" ,pc);
  
      if (pc) {
          // Close the peer connection
          pc.close();
          console.log("PeerConnection closed.");
      
          // Stop all tracks on the local stream
          if (localStreamRef.current) {
              localStreamRef.current.getTracks().forEach((track) => track.stop()); // Stop all tracks
              localStreamRef.current = null; // Reset the ref
            }
            if (remoteStreamRef.current) {
              remoteStreamRef.current.getTracks().forEach((track) => track.stop()); // Stop all tracks
  
              remoteStreamRef.current = null;
            }
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
          // Update UI or state
          setIsConnected(false);
          if(isMember){   
            setTimeout(() => {
              joinCall();
            }, 1000);              }
              
        } else {
          console.log("No active PeerConnection to close.");
        }
    };
  const createOffer = async () => {
    try {
      console.log("Generated Call ID:", callId);

      const stream = await startStream();
      pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      set(ref(db, `calls/${callId}`), { offer });
      const timestamp = Date.now(); // e.g., 1712507436243

      set(ref(db, `calls/${callId}/random_number`), timestamp);
      listenForUpdates(callId);
      console.log("Offer created:", offer);
      setIsConnected(true);
      peerConnectionRef.current.onconnectionstatechange = () => {
        const connectionState = peerConnectionRef.current.connectionState;
        console.log("Connection state:", connectionState);
        if (connectionState === "disconnected" || connectionState === "closed" || connectionState === "failed") {
          off(ref(db, `calls/${callId}/answer`)); // removes all listeners on that ref
          off(ref(db, `calls/${callId}/calleeCandidate`)); // same here     
          console.log("Call disconnected");
          disconnectCall();
        }
        if (connectionState === "connected") {

off(ref(db, `calls/${callId}/answer`)); // removes all listeners on that ref
          off(ref(db, `calls/${callId}/calleeCandidate`)); // same here               setIsRemoteConnected(true);
          removeCallNode();
        }
        setIsRemoteConnected(true);
      }
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };
      const pendingCandidates = [];

async function listenForUpdates(callId) {
    const callRef = ref(db, `calls/${callId}`);

    // Listen for the answer from Firebase
    onValue(ref(db, `calls/${callId}/answer`), (snapshot) => {
        const answer = snapshot.val();
        console.log("Received answer from Firebase:", answer);
    
        if (answer && answer.type === "answer" && answer.sdp) {
            pc
                .setRemoteDescription(
                    new RTCSessionDescription({
                        type: answer.type,
                        sdp: answer.sdp, // Use the 'description' field as the SDP
                    })
                )
                .then(() => {
                    console.log("Remote description set successfully.");
    
                    // Process queued ICE candidates
                    pendingCandidates.forEach((candidate) => {
                        pc.addIceCandidate(candidate)
                            .then(() => console.log("Queued ICE candidate added successfully."))
                            .catch((error) => console.error("Error adding queued ICE candidate:", error));
                    });
                    pendingCandidates.length = 0; // Clear the queue
                })
                .catch((error) => console.error("Error setting remote description:", error));
        } else {
            console.error("Invalid or incomplete answer received:", answer);
        }
    });
    
    // Listen for ICE candidates from Firebase
    onValue(ref(db, `calls/${callId}/calleeCandidate`), (snapshot) => {
        const remoteCandidates = snapshot.val();
        if (remoteCandidates) {
            Object.keys(remoteCandidates).forEach((key) => {
                const candidateData = remoteCandidates[key];
             

                if (candidateData && candidateData.candidate) {
                    const candidate = new RTCIceCandidate({
                        candidate: candidateData.candidate,
                        sdpMid: candidateData.sdpMid,
                        sdpMLineIndex: candidateData.sdpMLineIndex,
                    });
    
                    if (pc.remoteDescription) {
                        pc.addIceCandidate(candidate)
                            .then(() => console.log("ICE candidate added successfully."))
                            .catch((error) => console.error("Error adding ICE candidate:", error));
                    } else {
                        console.log("Remote description not set yet. Queueing candidate.");
                        pendingCandidates.push(candidate);
                    }
                } else {
                    console.error("Invalid candidate data:", candidateData);
                }
            });
        } else {
            console.error("No remote candidates received.");
        }

    });
}

const disconnectCall = () => {
  if(!isMember){
  removeCallNode();
  }
    const pc = peerConnectionRef.current;

    console.log("PeerConnection B" ,pc);

    if (pc) {
        // Close the peer connection
        pc.close();
        console.log("PeerConnection closed.");
    
        // Stop all tracks on the local stream
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop()); // Stop all tracks
            localStreamRef.current = null; // Reset the ref
          }
          if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach((track) => track.stop()); // Stop all tracks

            remoteStreamRef.current = null;
          }
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
        // Update UI or state
        setIsConnected(false);
        if(typeRole == 1){       
              navigate("/dashboard");
            }
              else if(typeRole == 2){
                navigate("/dashboard_diet");

              }
      } else {
        console.log("No active PeerConnection to close.");
      }
  };
  const removeCallNode = () => {
    const callRef = ref(db, `calls/${callId}`); // Adjust path as needed
    remove(callRef)
      .then(() => {
        console.log("Call node removed from Firebase.");
      })
      .catch((error) => {
        console.error("Error removing node:", error);
      });
  };
  const r_numberStore = useRef(null);
  const rrcallRef = ref(db, `calls/${callId}`);
  const rrcandidateRef = ref(db, `calls/${callId}/callerCandidate`);
    const handleCallSnapshot = async (snapshot) => {
      console.log("asdfasdfasda new set");
     

                      const data = snapshot.val();
                      console.log("asdfasdfasda rnumber ",data?.random_number);

                      if(data?.random_number &&  r_numberStore.current == null){
                        r_numberStore.current = data?.random_number;
                      }
                      if(r_numberStore.current < data?.random_number){
                        r_numberStore.current = data?.random_number;
                        off(ref(db, `calls/${callId}`)); // removes all listeners on that ref
                        off(ref(db, `calls/${callId}/callerCandidate`)); // same here
                       // disconnectCall();     
                        rejoinCall();
                                             console.log("asdfasdfasda new node created Rejonined ");

                      }
                              
    if (data?.offer  && pc.signalingState === "stable"&& !pc.currentRemoteDescription) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    }
    if (pc.signalingState === "have-remote-offer") {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      set(ref(db, `calls/${callId}/answer`), answer);
      console.log("✅ Answer created & sent.");
    }
    onValue(rrcandidateRef, handleCandidateSnapshot);

  };

  const handleCandidateSnapshot = (snapshot) => {
    const remoteCandidates = snapshot.val();
    if (remoteCandidates) {
      Object.keys(remoteCandidates).forEach((key) => {
        const candidateData = remoteCandidates[key];
        console.log("cdataa ", candidateData);

        if (candidateData?.candidate) {
          const candidate = new RTCIceCandidate({
            candidate: candidateData.candidate,
            sdpMid: candidateData.sdpMid,
            sdpMLineIndex: candidateData.sdpMLineIndex,
          });

          if (pc.remoteDescription) {
            pc.addIceCandidate(candidate)
              .then(() => console.log("ICE candidate added successfully."))
              .catch((error) =>
                console.error("Error adding ICE candidate:", error)
              );
          } else {
            console.log("Remote description not set yet. Queueing candidate.");
            pendingCandidates.push(candidate);
          }
        } else {
          console.error("Invalid candidate data:", candidateData);
        }
      });
    } else {
      console.error("No remote candidates received.");
    }
  };
  const rejoinCall = () => {
    if (peerConnectionRef.current) {
      const pc = peerConnectionRef.current;
  
      // Optional: remove all event listeners
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.onsignalingstatechange = null;
  
      // Stop all media tracks (if added)
      pc.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
  
      pc.close();
      peerConnectionRef.current = null;
      console.log("🔌 PeerConnection closed and cleaned up.");
      setTimeout(() => {
        off(ref(db, `calls/${callId}`)); // removes all listeners on that ref
        off(ref(db, `calls/${callId}/callerCandidate`)); // same here
        joinCall();
      }, 1000);
    }

  };
  const joinCall = async () => {

    try {
      const stream = await startStream();
      pc = new RTCPeerConnection(servers);
      peerConnectionRef.current = pc;
    console.log("PeerConnection A" ,pc);

          const callRef = ref(db, `calls/${callId}`);

          peerConnectionRef.current.onconnectionstatechange = () => {
            const connectionState = peerConnectionRef.current.connectionState;
            console.log("Connection state:", connectionState);
            if (connectionState === "disconnected" ||  connectionState === "closed" ||  connectionState === "failed" ) {
              console.log("Call disconnected");
              off(ref(db, `calls/${callId}`)); // removes all listeners on that ref
              off(ref(db, `calls/${callId}/callerCandidate`)); // same here
              disconnectCall();
            }
            if (connectionState === "connected") {
              off(ref(db, `calls/${callId}`)); // removes all listeners on that ref
              off(ref(db, `calls/${callId}/callerCandidate`)); // same here
              setIsRemoteConnected(true);
            }
          };
          pc.ontrack = (event) => {
            const [stream] = event.streams;
            remoteStreamRef.current = stream;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = stream;
            }
          };
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
   onValue(rrcallRef, handleCallSnapshot);

    pc.onicecandidate = event => {
        
        if (event.candidate && event.candidate.candidate) {
            console.log("New ICE candidate:", event.candidate);
            const postsRef = ref(db, `calls/${callId}/calleeCandidate`);
            const candidateType = event.candidate.sdpMLineIndex === 0 ? "audio" : "video";

            

push(postsRef, {
candidate: event.candidate.candidate,
sdpMid: event.candidate.sdpMLineIndex,
sdpMLineIndex: event.candidate.sdpMLineIndex
}).then(() => {
console.log('New post added');
}).catch((error) => {
console.error('Error pushing data:', error);
});
            
        }
    };

      setIsConnected(true);
    } catch (error) {
      console.error("Error joining call:", error);
    }
  };


  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
  {/* Remote Video - Fullscreen */}
  <video
    ref={remoteVideoRef}
    autoPlay
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover object-center z-10"
  />

  {/* Local Video - Floating on Top */}
  <video
  ref={localVideoRef}
  autoPlay
  playsInline
  muted
  className="absolute bottom-2 right-2 w-[20%] max-w-[160px] aspect-[9/16] border-2 border-white rounded-lg shadow-lg z-20 object-cover object-center transform scale-x-[-1]"
/>
<div className="absolute top-4 left-4 z-30 bg-black/50 px-4 py-2 rounded-md text-white flex flex-col gap-1 shadow-lg">
    <span className="font-semibold text-lg">{decodedName}</span>
    <span className="text-sm">{callDuration}</span>
  </div>
  {/* Controls */}
  <div className="absolute bottom-4 left-4 flex gap-2 z-30">
    {!isConnected ? (
      <>
       {!isMember ? (
    <button
      onClick={createOffer}
      className="px-4 py-2 text-white bg-green-600 rounded-md hover:opacity-80 text-sm font-semibold shadow-md"
    >
      Start
    </button>
  ) : (
    <button
      onClick={joinCall}
      className="px-4 py-2 text-white bg-blue-600 rounded-md hover:opacity-80 text-sm font-semibold shadow-md"
    >
      Join
    </button>
  )}
      </>
    ) : (
      <button
        onClick={disconnectCall}
        className="px-4 py-2 text-white bg-red-600 rounded hover:opacity-80 text-sm font-semibold"
      >
        Disconnect
      </button>
    )}
  </div>
</div>
  );
}
