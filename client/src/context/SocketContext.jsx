import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        newSocket.emit('join', user._id);
      });

      // Listen for real-time events
      newSocket.on('patient:created', (data) => {
        addNotification(`New patient registered: ${data.patient.fullName}`, 'info');
      });

      newSocket.on('appointment:created', (data) => {
        addNotification(`New appointment scheduled`, 'info');
      });

      newSocket.on('appointment:status', (data) => {
        addNotification(`Appointment status updated to ${data.appointment.status}`, 'info');
      });

      newSocket.on('exchange:created', (data) => {
        addNotification(`New clinical exchange received`, 'info');
      });

      newSocket.on('exchange:status', (data) => {
        addNotification(`Exchange status updated to ${data.exchange.status}`, 'info');
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, addNotification, clearNotification }}>
      {children}
    </SocketContext.Provider>
  );
};
