import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import { addNotification } from '../../features/notification/notificationSlice';
import { fetchAppointmentsByStatus } from '../../features/admin/adminSlice';
import { fetchMyAppointments } from '../../features/appointment/appointmentSlice';
import i18n from '../../i18n';

import { enUS, kk, ru } from "date-fns/locale";
import { format } from "date-fns";


const getLocale = (lang) => {
  if (!lang) return enUS;
  const base = lang.split("-")[0];
  if (base === "kk" || base === "kz") return kk;
  if (base === "ru") return ru;
  return enUS;
};

const InfoToastIcon = () => (
  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
);

const notificationSound = typeof window !== 'undefined' ? new Audio('/mixkit-software-interface-remove-2576.wav') : null;
notificationSound?.load();

const WebSocketProvider = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const formatNotificationParams = (params) => {
    if (!params || !params.dateTime) return params;

    const newParams = { ...params };
    const currentLang = i18n.language || 'en';
    const baseLang = currentLang.split("-")[0];
    const locale = getLocale(currentLang);

    const formatString = (baseLang === 'kz' || baseLang === 'kk' || baseLang === 'ru') ? 'PP HH:mm' : 'PP p';

    try {
      newParams.dateTime = format(new Date(params.dateTime), formatString, { locale });
    } catch (e) {
      console.warn("Error formatting notification date:", e);
    }

    return newParams;
  };
  useEffect(() => {
    if (!token) return;

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      console.error("Invalid token, cannot establish WebSocket connection.", error);
      return;
    }

    const userRoles = (decodedToken.roles || []).map(role => role.replace('ROLE_', ''));

    const stompClient = new Client({
      //webSocketFactory: () => new SockJS('https://engagement-system-production.up.railway.app/ws'),
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocketProvider: Connection successful.');

        const userDestination = '/user/queue/notifications';

        stompClient.subscribe(userDestination, (message) => {
          try {
            const notification = JSON.parse(message.body);
            const params = formatNotificationParams(notification.messageParams);

            const translatedMessage = i18n.t(notification.messageKey, params);
            notificationSound?.play().catch(e => console.warn("Sound playback failed:", e));

            dispatch(addNotification(notification));
            toast.success(translatedMessage || "You have a new notification!");

            dispatch(fetchMyAppointments());
          } catch (error) {
            console.error("WebSocketProvider: Error processing user message:", error);
          }
        });

        if (userRoles.includes('ADMIN')) {
          stompClient.subscribe('/topic/admin/new-appointments', (message) => {
            try {
              notificationSound?.play().catch(e => console.warn("Sound playback failed:", e));
              const payload = JSON.parse(message.body);
              const translatedMessage = i18n.t(payload.messageKey, payload.params);

              toast((t) => (<span onClick={() => toast.dismiss(t.id)}>{translatedMessage}</span>), { icon: <InfoToastIcon /> });
              dispatch(fetchAppointmentsByStatus('PENDING'));
            } catch (error) {
              console.error("WebSocketProvider: Error processing admin message:", error);
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
  }, [token, dispatch]);

  return children;
};

export default WebSocketProvider;
