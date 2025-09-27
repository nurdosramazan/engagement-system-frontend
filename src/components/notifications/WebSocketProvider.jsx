import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { addNotification } from '../../features/notification/notificationSlice';
import { fetchAppointmentsByStatus } from '../../features/admin/adminSlice';
import { fetchMyAppointments } from '../../features/appointment/appointmentSlice';

const InfoToastIcon = () => (
    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
);

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
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocketProvider: Connection successful.');
        const userDestination = '/user/queue/notifications';

        stompClient.subscribe(userDestination, (message) => {
          console.log('WebSocketProvider: [USER] Message received!', message.body);
          try {
            const notification = JSON.parse(message.body);
            console.log('WebSocketProvider: [USER] Parsed notification:', notification);
            
            console.log('WebSocketProvider: [USER] Dispatching addNotification...');
            dispatch(addNotification(notification));
            toast.success(notification.message || "You have a new notification!");
            
            const lowerCaseMessage = notification.message.toLowerCase();
            if (lowerCaseMessage.includes('appointment') || lowerCaseMessage.includes('application')) {
                console.log('WebSocketProvider: [USER] Refreshing user appointments.');
                dispatch(fetchMyAppointments());
            }
          } catch (error) {
            console.error("WebSocketProvider: [USER] Failed to process message.", error);
          }
        });

        if (user.roles.includes('ROLE_ADMIN')) {
          stompClient.subscribe('/topic/admin/new-appointments', (message) => {
            console.log('WebSocketProvider: [ADMIN] Message received!', message.body);
            try {
                toast( (t) => (<span onClick={() => toast.dismiss(t.id)}>{message.body}</span>), { icon: <InfoToastIcon /> });
                console.log('WebSocketProvider: [ADMIN] Refreshing admin pending appointments.');
                dispatch(fetchAppointmentsByStatus('PENDING'));
            } catch (error) {
                console.error("WebSocketProvider: [ADMIN] Failed to process message.", error);
            }
          });
        }
      },
      onStompError: (frame) => {
        console.error('WebSocketProvider: STOMP Error', frame);
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

