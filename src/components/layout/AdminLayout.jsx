import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const AdminDashboardIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3a4 4 0 00-4 4v2m18 0v-2a4 4 0 00-4-4h-2a4 4 0 00-4 4v2m4 4h.01M12 6h.01M6 6h.01M18 6h.01M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ReportsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const SlotsIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const LogoutIcon = () => (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
);


const AdminLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };
    
    const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-red-100 text-red-700 font-bold' : 'font-medium'
    }`;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <aside className="w-64 bg-white shadow-lg flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-3xl font-extrabold text-red-600 tracking-wider">
                        Engage
                        <span className="block text-sm font-normal text-gray-500 -mt-1">Admin Panel</span>
                    </h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <NavLink to="/admin/dashboard" className={navLinkClasses}>
                        <AdminDashboardIcon />
                        <span className="ml-4">Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/reports" className={navLinkClasses}>
                        <ReportsIcon />
                        <span className="ml-4">Reports</span>
                    </NavLink>
                    <NavLink to="/admin/generate-slots" className={navLinkClasses}>
                        <SlotsIcon />
                        <span className="ml-4">Generate Slots</span>
                    </NavLink>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md p-4 flex justify-end items-center">
                    <div className="flex items-center">
                        <span className="text-gray-600 mr-4">
                            Welcome, <span className="font-semibold">{user?.phoneNumber || 'Admin'}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                            <LogoutIcon />
                            Logout
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
