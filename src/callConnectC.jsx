import React, { useEffect, useState, useRef } from "react";
import { getDatabase, ref, set, push, onValue, remove, off, onDisconnect } from "firebase/database";
import { initializeApp } from "firebase/app";
import { useNavigate, useParams } from "react-router-dom";

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
  const listenersRef = useRef([]);
  const callId = id;
  const ftitle = "calls";

  const servers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  };

  const addListener = (dbRef, callback) => {
    onValue(dbRef, callback);
    listenersRef.current.push({ ref: dbRef, callback });
  };

  const removeAllListeners = () => {
    listenersRef.current.forEach(({ ref, callback }) => {
      off(ref, 'value', callback);
    });
    listenersRef.current = [];
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(servers);

    pc.onicecandidate = event => {
      if (event.candidate) {
        const target = isMember ? "calleeCandidate" : "callerCandidate";
        push(ref(db, `${ftitle}/${callId}/${target}`), event.candidate);
      }
    };

    pc.ontrack = event => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setIsRemoteConnected(true);
        removeAllListeners();
      } else if (["disconnected", "failed", "closed"].includes(state)) {
        disconnectCall();
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

  const listenForUpdates = (pc) => {
    const pendingCandidates = [];

    addListener(ref(db, `${ftitle}/${callId}/answer`), (snapshot) => {
      const answer = snapshot.val();
      if (answer?.type === "answer" && answer?.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(answer)).then(() => {
          pendingCandidates.forEach(c => pc.addIceCandidate(c));
          pendingCandidates.length = 0;
        }).catch(console.error);
      }
    });

    addListener(ref(db, `${ftitle}/${callId}/calleeCandidate`), (snapshot) => {
      const candidates = snapshot.val();
      if (candidates) {
        Object.values(candidates).forEach(data => {
          const candidate = new RTCIceCandidate(data);
          if (pc.remoteDescription) {
            pc.addIceCandidate(candidate).catch(console.error);
          } else {
            pendingCandidates.push(candidate);
          }
        });
      }
    });
  };

  const createOffer = async () => {
    const stream = await startStream();
    const pc = createPeerConnection();
    peerConnectionRef.current = pc;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await set(ref(db, `${ftitle}/${callId}`), { offer });
    listenForUpdates(pc);
    setIsConnected(true);
  };

  const joinCall = async () => {
    const stream = await startStream();
    const pc = createPeerConnection();
    peerConnectionRef.current = pc;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    addListener(ref(db, `${ftitle}/${callId}`), async (snapshot) => {
      const data = snapshot.val();
      if (data?.offer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await set(ref(db, `${ftitle}/${callId}/answer`), answer);
      }
    });

    addListener(ref(db, `${ftitle}/${callId}/callerCandidate`), (snapshot) => {
      const candidates = snapshot.val();
      if (candidates) {
        Object.values(candidates).forEach(data => {
          const candidate = new RTCIceCandidate(data);
          if (pc.remoteDescription) {
            pc.addIceCandidate(candidate).catch(console.error);
          }
        });
      }
    });

    setIsConnected(true);
  };

  const disconnectCall = () => {
    removeAllListeners();
    if (typeRole === "2") remove(ref(db, `${ftitle}/${callId}`));
    const pc = peerConnectionRef.current;
    if (pc) pc.close();
    [localStreamRef, remoteStreamRef].forEach(ref => {
      if (ref.current) {
        ref.current.getTracks().forEach(track => track.stop());
        ref.current = null;
      }
    });
    [localVideoRef, remoteVideoRef].forEach(ref => {
      if (ref.current) ref.current.srcObject = null;
    });
    setIsConnected(false);
    navigate(typeRole === "1" ? "/dashboard" : "/dashboard_diet");
  };

  useEffect(() => {
    if (typeRole === "1") setIsMember(true);
    else if (typeRole === "2") setIsMember(false);
  }, []);

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