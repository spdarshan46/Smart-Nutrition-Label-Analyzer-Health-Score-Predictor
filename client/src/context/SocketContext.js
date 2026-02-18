import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('analysis-progress', (data) => {
        if (data.userId === user.id) {
          setProgress(data.progress);
          setAnalysisStage(data.stage);
          
          if (data.progress === 100) {
            toast.success('Analysis complete!');
            setTimeout(() => {
              setProgress(0);
              setAnalysisStage('');
            }, 3000);
          }
        }
      });

      newSocket.on('new-analysis', (data) => {
        if (data.userId === user.id) {
          toast.success('New analysis added!');
        }
      });

      newSocket.on('analysis-error', (data) => {
        if (data.userId === user.id) {
          toast.error(data.error);
          setProgress(0);
          setAnalysisStage('');
        }
      });

      return () => newSocket.close();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, progress, analysisStage }}>
      {children}
    </SocketContext.Provider>
  );
};