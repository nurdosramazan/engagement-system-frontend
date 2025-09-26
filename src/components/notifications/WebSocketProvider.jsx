import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';

const WebSocketProvider = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) return;

    const stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket Connected!');
        
        stompClient.subscribe(`/user/${user.phoneNumber}/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          toast.success(`Notification: ${notification.message}`);
        });

        if (user.roles.includes('ROLE_ADMIN')) {
          stompClient.subscribe('/topic/admin/new-appointments', (message) => {
            toast.info(`New Application: ${message.body}`);
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
  }, [token, user]);

  return children;
};

export default WebSocketProvider;