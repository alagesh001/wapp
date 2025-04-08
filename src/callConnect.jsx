import React, { useEffect,useState, useRef } from "react";
import { ref, set, push, onValue,remove,off,onDisconnect } from "firebase/database";
import { useNavigate,useParams  } from "react-router-dom";
import { signInAnonymously, signOut,deleteUser } from "firebase/auth";
import { auth ,db} from "./firebase";
import { useAuth } from "./useAuth";


export default function CallConnect() {
  const wakeLock = useRef(null);

  const { id, name } = useParams();

  const decodedName = decodeURIComponent(name);
  const callId = id;
  const caltitle = "calls";
  const calecan = "calleeCandidate";
  const callercan = "callerCandidate";
  const acand = "calicecandidate";
  const recand = "sendicecandidate";
  const secand = "recicecandidate";


    const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [isremoteConnected, setIsRemoteConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(null);

  const navigate = useNavigate();
  const typeRole = localStorage.getItem("type");
  const [isMember, setIsMember] = useState(true);
  const [callDuration, setCallDuration] = useState("00:00");
const [startTime, setStartTime] = useState(null);
const user = useAuth();

const handleLogin = async () => {
  try {
    await signInAnonymously(auth);
    console.log("Signed in anonymously");

    // ✅ Do stuff after login here
    // e.g. write to DB, start WebRTC, etc.

  } catch (err) {
    console.error("Failed to sign in anonymously:", err);
  }
};
const handleLogout = async () => {
  try {
    (async () => {  await deleteUser( auth.currentUser); })();
    console.log("Anonymous user deleted");
  } catch (err) {
    console.error("Failed to delete anonymous user:");
  }
};
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
 // handleLogin();
  const handlePopState = async () => {
    try {
      const nodeRef = ref(db, `${caltitle}/${callId}`);
      await remove(nodeRef);
      disconnectCall();
      console.log("Node removed on back");
    } catch (err) {
      console.error("Error removing node:", err);
    }

    // Properly await logout
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, []);

  useEffect(() => {
    return () => {
      if (typeRole == 1) {
        off(ref(db, `${caltitle}/${callId}`)); // removes all listeners on that ref
        off(ref(db, `${caltitle}/${callId}/${callercan}`)); // same here     
         } else if (typeRole == 2) {
          off(ref(db, `${caltitle}/${callId}/answer`)); // removes all listeners on that ref
          off(ref(db, `${caltitle}/${callId}/${calecan}`)); // same here     

      }
    
    };
  }, []);
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock.current = await navigator.wakeLock.request('screen');
        //  console.log("Wake lock activated ✅");

          // Handle when the wake lock is released (e.g., user switches tabs)
          wakeLock.current.addEventListener('release', () => {
         //   console.log("Wake lock was released ❌");
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
             // console.log("New ICE candidate:", event.candidate);
              const postsRef = ref(db, `${caltitle}/${callId}/${callercan}`);
              const candidateType = event.candidate.sdpMLineIndex === 0 ? "audio" : "video";
  
              
  
  push(postsRef, {
  candidate: event.candidate.candidate,
  sdpMid: event.candidate.sdpMLineIndex,
  sdpMLineIndex: event.candidate.sdpMLineIndex
  }).then(() => {
  console.log('New post added');
  }).catch((error) => {
  console.error('Error pushing data:');
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
      console.error("Error accessing media devices:");
    }
  };

  const retryConnection = () => {
    
      const pc = peerConnectionRef.current;
  
     // console.log("PeerConnection B" ,pc);
  
      if (pc) {
          // Close the peer connection
          pc.close();
         // console.log("PeerConnection closed.");
      
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
         // console.log("No active PeerConnection to close.");
        }
    };
  const createOffer = async () => {
    try {
      setIsConnecting(true);
     // console.log("Generated Call ID:", callId);
      const callRefIAs = ref(db, `${caltitle}/${callId}`);

      const stream = await startStream();
      pc = createPeerConnection();
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      set(ref(db, `${caltitle}/${callId}`), { offer });
      const timestamp = Date.now(); // e.g., 1712507436243

      set(ref(db, `${caltitle}/${callId}/random_number`), timestamp);
      listenForUpdates(callId);
      console.log("Offer created:", offer);
      setIsConnected(true);
      peerConnectionRef.current.onconnectionstatechange = () => {
        const connectionState = peerConnectionRef.current.connectionState;
      //  console.log("Connection state:", connectionState);
        if (connectionState === "disconnected" || connectionState === "closed" || connectionState === "failed") {
          off(ref(db, `${caltitle}/${callId}/answer`)); // removes all listeners on that ref
          off(ref(db, `${caltitle}/${callId}/${calecan}`)); // same here     
          console.log("Call disconnected");
          disconnectCall();
        }
        if (connectionState === "connected") {
          setIsConnecting(false);

off(ref(db, `${caltitle}/${callId}/answer`)); // removes all listeners on that ref
          off(ref(db, `${caltitle}/${callId}/${calecan}`)); // same here               
          removeCallNode();
        }
        setIsRemoteConnected(true);
      }
        onDisconnect(callRefIAs).remove();
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };
      const pendingCandidates = [];

async function listenForUpdates(callId) {
    const callRef = ref(db, `${caltitle}/${callId}`);

    // Listen for the answer from Firebase
    onValue(ref(db, `${caltitle}/${callId}/answer`), (snapshot) => {
        const answer = snapshot.val();
      //  console.log("Received answer from Firebase:", answer);
    
        if (answer && answer.type === "answer" && answer.sdp) {
            pc
                .setRemoteDescription(
                    new RTCSessionDescription({
                        type: answer.type,
                        sdp: answer.sdp, // Use the 'description' field as the SDP
                    })
                )
                .then(() => {
                //    console.log("Remote description set successfully.");
    
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
            console.error("Invalid or incomplete answer received:");
        }
    });
    
    // Listen for ICE candidates from Firebase
    onValue(ref(db, `${caltitle}/${callId}/${calecan}`), (snapshot) => {
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
                //    console.error("Invalid candidate data:", candidateData);
                }
            });
        } else {
          //  console.error("No remote candidates received.");
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
        if(typeRole == 1){       
          navigate("/dashboard");
        }
          else if(typeRole == 2){
            navigate("/dashboard_diet");

          }
      //  console.log("No active PeerConnection to close.");
      }
     // handleLogout();

  };
  const removeCallNode = () => {
    const callRef = ref(db, `${caltitle}/${callId}`); // Adjust path as needed
    remove(callRef)
      .then(() => {
       console.log("Call node removed from Firebase.");
      })
      .catch((error) => {
        console.error("Error removing node:");
      });
  };
  const r_numberStore = useRef(null);
  const rrcallRef = ref(db, `${caltitle}/${callId}`);
  const rrcandidateRef = ref(db, `${caltitle}/${callId}/${callercan}`);
    const handleCallSnapshot = async (snapshot) => {
   //   console.log("asdfasdfasda new set");
     

                      const data = snapshot.val();
                     // console.log("asdfasdfasda rnumber ",data?.random_number);

                      if(data?.random_number &&  r_numberStore.current == null){
                        r_numberStore.current = data?.random_number;
                      }
                      if(r_numberStore.current < data?.random_number){
                        r_numberStore.current = data?.random_number;
                        off(ref(db, `${caltitle}/${callId}`)); // removes all listeners on that ref
                        off(ref(db, `${caltitle}/${callId}/${callercan}`)); // same here
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
      set(ref(db, `${caltitle}/${callId}/answer`), answer);
      //console.log("✅ Answer created & sent.");
    }
    onValue(rrcandidateRef, handleCandidateSnapshot);

  };

  const handleCandidateSnapshot = (snapshot) => {
    const remoteCandidates = snapshot.val();
    if (remoteCandidates) {
      Object.keys(remoteCandidates).forEach((key) => {
        if(isremoteConnected){
          return;
        }
        const candidateData = remoteCandidates[key];

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
                console.error("Error adding ICE candidate:")
              );
          } else {
            //console.log("Remote description not set yet. Queueing candidate.");
            pendingCandidates.push(candidate);
          }
        } else {
         // console.error("Invalid candidate data:", candidateData);
        }
      });
    } else {
     // console.error("No remote candidates received.");
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
    //  console.log("🔌 PeerConnection closed and cleaned up.");
      setTimeout(() => {
        off(ref(db, `${caltitle}/${callId}`)); // removes all listeners on that ref
        off(ref(db, `${caltitle}/${callId}/${callercan}`)); // same here
        joinCall();
      }, 1000);
    }

  };
  const joinCall = async () => {

    try {
      setIsConnecting(true);

      const stream = await startStream();
      pc = new RTCPeerConnection(servers);
      peerConnectionRef.current = pc;
   // console.log("PeerConnection A" ,pc);

          const callRef = ref(db, `${caltitle}/${callId}`);

          peerConnectionRef.current.onconnectionstatechange = () => {
            const connectionState = peerConnectionRef.current.connectionState;
          //  console.log("Connection state:", connectionState);
            if (connectionState === "disconnected" ||  connectionState === "closed" ||  connectionState === "failed" ) {
              console.log("Call disconnected");
              off(ref(db, `${caltitle}/${callId}`)); // removes all listeners on that ref
              off(ref(db, `${caltitle}/${callId}/${callercan}`)); // same here
              disconnectCall();
            }
            if (connectionState === "connected") {
              setIsConnecting(false);

              off(ref(db, `${caltitle}/${callId}`)); // removes all listeners on that ref
              off(ref(db, `${caltitle}/${callId}/${callercan}`)); // same here
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
           // console.log("New ICE candidate:", event.candidate);
            const postsRef = ref(db, `${caltitle}/${callId}/${calecan}`);
            const candidateType = event.candidate.sdpMLineIndex === 0 ? "audio" : "video";

            

push(postsRef, {
candidate: event.candidate.candidate,
sdpMid: event.candidate.sdpMLineIndex,
sdpMLineIndex: event.candidate.sdpMLineIndex
}).then(() => {
console.log('New post added');
}).catch((error) => {
console.error('Error pushing data:');
});
            
        }
    };

      setIsConnected(true);
    } catch (error) {
      console.error("Error joining call:");
    }
  };


  return (
<div className="fixed inset-0 bg-black overflow-hidden">
  {/* Remote Video - Fullscreen */}
  {isConnecting && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
      <p className="text-white text-sm font-medium">Connecting...</p>
    </div>
  </div>
)}
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
  <div className="absolute top-4 right-4 z-30">
      <button
        onClick={disconnectCall} // or your custom back logic
        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 shadow-md text-sm font-semibold"
      >
        ✕
      </button>
    </div>
  {/* Controls */}
  <div className="absolute bottom-4 left-4 flex gap-2 z-30">
    {!isConnected ? (
      <>
       {!isMember ? (
    <button
      onClick={createOffer}
      className="px-6 py-3 text-white bg-green-600 rounded-md hover:opacity-80 text-sm font-semibold shadow-md"
    >
      Start
    </button>
  ) : (
    <button
      onClick={joinCall}
      className="px-6 py-3 text-white bg-blue-600 rounded-md hover:opacity-80 text-sm font-semibold shadow-md"
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
