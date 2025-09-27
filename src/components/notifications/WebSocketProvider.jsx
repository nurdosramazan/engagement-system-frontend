import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { addNotification } from '../../features/notification/notificationSlice'; // Import the new action
import { fetchAppointmentsByStatus } from '../../features/admin/adminSlice'; // Import admin action

const WebSocketProvider = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || !user) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket Connected!');
        
        // **REAL-TIME UPDATE FOR USER NOTIFICATIONS**
        stompClient.subscribe(`/user/${user.phoneNumber}/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          // Dispatch action to add the notification to the Redux store
          dispatch(addNotification(notification));
          toast.success(`Notification: ${notification.message}`);
        });

        // **REAL-TIME UPDATE FOR ADMIN DASHBOARD**
        if (user.roles.includes('ADMIN')) {
          stompClient.subscribe('/topic/admin/new-appointments', (message) => {
            toast.info(`New Application: ${message.body}`);
            // Dispatch action to refetch the list of pending appointments
            dispatch(fetchAppointmentsByStatus('PENDING'));
          });
        }
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [token, user, dispatch]);

  return children;
};

export default WebSocketProvider;
