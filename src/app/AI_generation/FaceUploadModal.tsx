import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- MODIFICATION: Prop type changed from string to Blob ---
const FaceUploadModal = ({ onClose, onUploadSuccess }: { onClose: () => void; onUploadSuccess?: (videoBlob: Blob, fileExtension: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentStreamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const [recordingTime, setRecordingTime] = useState(0);
  const [maxTimeReached, setMaxTimeReached] = useState(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopCurrentStream = () => {
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => track.stop());
      currentStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
        initialStream.getTracks().forEach(track => track.stop());

        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        const laptopDevice = videoDevices.find(device =>
          !device.label.toLowerCase().includes('phone')
        ) || videoDevices[0];

        if (laptopDevice) {
          setSelectedDeviceId(laptopDevice.deviceId);
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: laptopDevice.deviceId } }
          });
          currentStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    getCameraStream();

    return () => {
      stopCurrentStream();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const startRecordingTimer = () => {
    setRecordingTime(0);
    setMaxTimeReached(false);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 30) {
          handleAutoStopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const handleAutoStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMaxTimeReached(true);
      stopRecordingTimer();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      
      const options = { mimeType: 'video/mp4' };
      let recorder;
      try {
        if (MediaRecorder.isTypeSupported(options.mimeType)) {
          recorder = new MediaRecorder(stream, options);
          console.log('Recording with video/mp4');
        } else {
          console.warn('video/mp4 not supported, falling back to webm');
          recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        }
      } catch (e) {
        console.error('Error creating MediaRecorder, falling back to webm:', e);
        recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      }

      setMediaRecorder(recorder);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      recorder.start();
      setIsRecording(true);
      setMaxTimeReached(false);
      startRecordingTimer();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      stopRecordingTimer();
    }
  };

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    try {
      stopCurrentStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      currentStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error switching camera:", err);
    }
  };

  const handleClose = () => {
    stopCurrentStream();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    onClose();
  };

  // --- MODIFICATION: This function no longer uploads. ---
  // It just passes the recorded Blob back to the parent.
  const handleConfirmVideo = () => {
    if (recordedChunks.length > 0) {
      
      const mimeType = mediaRecorder?.mimeType || 'video/webm';
      const fileExtension = mimeType.includes('mp4') ? '.mp4' : '.webm';
      
      const blob = new Blob(recordedChunks, { type: mimeType });

      if (onUploadSuccess) {
        onUploadSuccess(blob, fileExtension);
      }
      
      setRecordedChunks([]);
      handleClose();
    }
  };

  const showRecordingIndicator = isRecording && !maxTimeReached;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative bg-white/10 p-8 rounded-2xl border border-white/20 text-center max-w-6xl mx-4">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-white/70 hover:bg-white/90 rounded-full transition-colors"
        >
          <CloseIcon />
        </button>
        <h3 className="text-xl font-semibold text-white mb-6">Upload Face Video</h3>
        
        <div className="flex gap-8 items-start">
          {/* Tutorial Images Section */}
          <div className="w-64 bg-black/30 rounded-lg p-4 border border-white/20">
            <h4 className="text-white font-medium mb-4 text-center">Examples</h4>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-white/10">
                <Image src="https://i.postimg.cc/44rr24LZ/Gemini-Generated-Image-az9mhdaz9mhdaz9m.png" alt="Good Example 1" width={256} height={128} className="w-full h-32 rounded object-cover mb-2" />
                <p className="text-gray-300 text-xs text-center">Face centered and well lit</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-white/10">
                <Image src="https://i.postimg.cc/Kv6sf9Yj/Gemini-Generated-Image-96gjve96gjve96gj.png" alt="Good Example 2" width={256} height={128} className="w-full h-32 rounded object-cover mb-2" />
                <p className="text-gray-300 text-xs text-center">Slight Head Movement</p>
              </div>
            </div>
          </div>

          {/* Camera Preview Section */}
          <div className="flex-1 max-w-md">
            {devices.length > 1 && (
              <div className="mb-4 flex items-center gap-3">
                <label className="text-white font-medium text-sm">Select Camera:</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="flex-1 max-w-xs p-2 bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 text-xs"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative w-full mx-auto">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className={`w-full rounded-lg ${showRecordingIndicator ? 'ring-4 ring-red-500' : ''}`}
              ></video>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="border-2 border-dashed border-purple-400 rounded-lg flex items-center justify-center"
                  style={{
                    width: '50%',
                    height: '60%',
                    maxWidth: '240px',
                    maxHeight: '300px'
                  }}
                >
                  {!isRecording && (
                    <div className="text-purple-400 text-xs font-medium bg-black/50 px-2 py-1 rounded">
                      Position Face Here
                    </div>
                  )}
                </div>
              </div>
              {showRecordingIndicator && (
                <>
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600/90 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <span className="text-white text-xs font-medium">REC</span>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-mono font-medium">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                </>
              )}
              {maxTimeReached && (
                <div className="absolute top-4 left-4 bg-black/70 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-mono font-medium">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}
            </div>
            <div className="text-gray-300 text-sm mt-4 text-left">
              <ul className="space-y-1 list-disc list-inside">
                <li>Position your face within the outlined area</li>
                <li>Keep your lips shut</li>
                <li>Ensure good lighting in the room</li>
                <li>Keep the camera in front of your face</li>
                <li>Record a 15-20 second video (max 25 seconds)</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={maxTimeReached}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                } ${maxTimeReached ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRecording ? 'Stop Recording' : 'Record'}
              </button>
              
              {/* --- MODIFICATION: "Upload Video" is now "Confirm Video" --- */}
              <button
                onClick={handleConfirmVideo}
                disabled={recordedChunks.length === 0}
                className="px-6 py-3 rounded-lg font-semibold transition-all bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Video
              </button>
              
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-lg font-semibold transition-all bg-gray-600 hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
            </div>
            {maxTimeReached && (
              <div className="mt-4 text-green-400 text-sm">
                Recording completed! You can now upload your video.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceUploadModal;