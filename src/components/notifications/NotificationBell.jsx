import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markAsRead } from '../../features/notification/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

const BellIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

const NotificationBell = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector((state) => state.notifications);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState && unreadCount > 0) {
            dispatch(markAsRead());
        }
    };

    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className="relative text-gray-600 hover:text-gray-800 focus:outline-none"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 animate-fade-in-down"
                >
                    <div className="p-4 font-bold border-b">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {safeNotifications.length > 0 ? (
                            safeNotifications.map(notif => (
                                <div key={notif.id} className={`p-4 border-b hover:bg-gray-50 ${!notif.isRead ? 'bg-indigo-50' : ''}`}>
                                    <p className="text-sm text-gray-800">{notif.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

