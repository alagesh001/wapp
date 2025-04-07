import React, { useEffect, useState, useRef } from "react";
import { getDatabase, ref, set, push, onValue, remove, off, onDisconnect } from "firebase/database";
import { initializeApp } from "firebase/app";
import { useNavigate, useParams } from "react-router-dom";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

initializeApp(firebaseConfig);
const db = getDatabase();

export default function CallConnect() {
  const wakeLock = useRef(null);
  const { id, name } = useParams();
  const decodedName = decodeURIComponent(name);
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
  const listenersRef = useRef([]); // ✅ to track listeners
  const callId = id;
  const ftitle = import.meta.env.VITE_F_TITLE;

  let pc;
  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    return () => {
      removeAllListeners();
    };
  }, []);

  const addListener = (dbRef, callback) => {
    onValue(dbRef, callback);
    listenersRef.current.push({ ref: dbRef, callback });
  };
  const callRefIs = ref(db, `${ftitle}/${callId}`);
  onDisconnect(callRefIs).remove();

  const removeAllListeners = () => {
    listenersRef.current.forEach(({ ref, callback }) => {
      off(ref, 'value', callback);
    });
    listenersRef.current = [];
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
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock.current = await navigator.wakeLock.request('screen');
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
      if (document.visibilityState === "visible") requestWakeLock();
    });
    return () => {
      if (wakeLock.current) {
        wakeLock.current.release();
        wakeLock.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeRole == 1) setIsMember(true);
    else if (typeRole == 2) setIsMember(false);
  }, []);

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
      if (event.candidate?.candidate) {
        const postsRef = ref(db, `${ftitle}/${callId}/callerCandidate`);
        push(postsRef, {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        }).catch((error) => console.error('Error pushing candidate:', error));
      }
    };
    return pc;
  };

  const startStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const createOffer = async () => {
    try {
      const stream = await startStream();
      pc = createPeerConnection();
      peerConnectionRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await set(ref(db, `${ftitle}/${callId}`), { offer });
      listenForUpdates(callId);
      setIsConnected(true);

      peerConnectionRef.current.onconnectionstatechange = () => {
        const connectionState = peerConnectionRef.current.connectionState;
        if (["disconnected", "closed"].includes(connectionState)) {
        

          disconnectCall();
        }
        if (connectionState === "connected") {
          setIsRemoteConnected(true);
          removeCallNode();
          removeAllListeners();
        }
      };
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  async function listenForUpdates(callId) {
    const pendingCandidates = [];
    const answerRef = ref(db, `${ftitle}/${callId}/answer`);
    const calleeCandidateRef = ref(db, `${ftitle}/${callId}/calleeCandidate`);

    addListener(answerRef, (snapshot) => {
      const answer = snapshot.val();
      if (answer?.type === "answer" && answer?.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(answer)).then(() => {
          pendingCandidates.forEach((c) => pc.addIceCandidate(c));
          pendingCandidates.length = 0;
        }).catch(console.error);
      }
    });

    addListener(calleeCandidateRef, (snapshot) => {
      const remoteCandidates = snapshot.val();
      if (remoteCandidates) {
        Object.values(remoteCandidates).forEach((candidateData) => {
          if (candidateData?.candidate) {
            const candidate = new RTCIceCandidate(candidateData);
            if (pc.remoteDescription) {
              pc.addIceCandidate(candidate).catch(console.error);
            } else {
              pendingCandidates.push(candidate);
            }
          }
        });
      }
    });
  }

  const joinCall = async () => {
    const stream = await startStream();
    pc = new RTCPeerConnection(servers);
    peerConnectionRef.current = pc;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    const callRef = ref(db, `${ftitle}/${callId}`);

    peerConnectionRef.current.onconnectionstatechange = () => {
      const connectionState = peerConnectionRef.current.connectionState;
      if (["disconnected", "closed"].includes(connectionState)) {
     // removeCallNode();
        disconnectCall();
      
    }
    if (connectionState === "failed") {setIsRemoteConnected(true);
      disconnectCall();
        //removeCallNode();

    }
      if (connectionState === "connected") {setIsRemoteConnected(true);
        removeAllListeners();
          //removeCallNode();

      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    };

    const pendingCandidates = [];

    addListener(callRef, async (snapshot) => {
      const data = snapshot.val();
      if (data?.offer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await set(ref(db, `${ftitle}/${callId}/answer`), answer);
      }
    });

    addListener(ref(db, `${ftitle}/${callId}/callerCandidate`), (snapshot) => {
      const remoteCandidates = snapshot.val();
      if (remoteCandidates) {
        Object.values(remoteCandidates).forEach((candidateData) => {
          if (candidateData?.candidate) {
            const candidate = new RTCIceCandidate(candidateData);
            if (pc.remoteDescription) {
              pc.addIceCandidate(candidate).catch(console.error);
            } else {
              pendingCandidates.push(candidate);
            }
          }
        });
      }
    });

    pc.onicecandidate = event => {
      if (event.candidate?.candidate) {
        push(ref(db, `${ftitle}/${callId}/calleeCandidate`), {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        }).catch(console.error);
      }
    };

    setIsConnected(true);
  };

  const disconnectCall = () => {
    removeAllListeners();
    if (typeRole == 2)  removeCallNode();
  
    const pc = peerConnectionRef.current;
    if (pc) {
      pc.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((track) => track.stop());
        remoteStreamRef.current = null;
      }
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setIsConnected(false);
      if (typeRole == 1) navigate("/dashboard");
      else if (typeRole == 2) navigate("/dashboard_diet");
    }
  };

  const removeCallNode = () => {
    remove(ref(db, `${ftitle}/${callId}`)).catch(console.error);
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <video ref={remoteVideoRef} autoPlay playsInline className="absolute top-0 left-0 w-full h-full object-cover object-center z-10" />
      <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-2 right-2 w-[20%] max-w-[160px] aspect-[9/16] border-2 border-white rounded-lg shadow-lg z-20 object-cover object-center transform scale-x-[-1]" />
      <div className="absolute top-4 left-4 z-30 bg-black/50 px-4 py-2 rounded-md text-white flex flex-col gap-1 shadow-lg">
        <span className="font-semibold text-lg">{decodedName}</span>
        <span className="text-sm">{callDuration}</span>
      </div>
      <div className="absolute bottom-4 left-4 flex gap-2 z-30">
        {!isConnected ? (
          !isMember ? (
            <button onClick={createOffer} className="px-4 py-2 text-white bg-green-600 rounded-md hover:opacity-80 text-sm font-semibold shadow-md">Start</button>
          ) : (
            <button onClick={joinCall} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:opacity-80 text-sm font-semibold shadow-md">Join</button>
          )
        ) : (
          <button onClick={disconnectCall} className="px-4 py-2 text-white bg-red-600 rounded hover:opacity-80 text-sm font-semibold">Disconnect</button>
        )}
      </div>
    </div>
  );
}
