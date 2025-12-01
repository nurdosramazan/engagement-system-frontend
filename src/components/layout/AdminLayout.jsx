import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from '../notifications/NotificationBell';
import Footer from '../layout/Footer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

const AdminDashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H3a4 4 0 00-4 4v2m18 0v-2a4 4 0 00-4-4h-2a4 4 0 00-4 4v2m4 4h.01M12 6h.01M6 6h.01M18 6h.01M7 20h10a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ReportsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const SlotsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ScheduleIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const UserViewIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const LogIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);
const ShieldIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

const AdminLayout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSuperAdminMenuOpen, setIsSuperAdminMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.roles?.includes('SUPERADMIN');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-gray-700 hover:bg-red-100 rounded-lg transition-colors duration-200 ${isActive ? 'bg-red-100 text-red-700 font-bold' : 'font-medium'
    }`;
  const subNavLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2 ml-4 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 ${isActive ? 'bg-gray-100 text-indigo-700 font-bold' : 'font-medium'
    }`;

  return (
    <div className="relative min-h-screen md:flex">
      <div
        className={`fixed inset-0 bg-black opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'
          }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      <aside
        className={`fixed inset-y-0 left-0 bg-white shadow-lg w-64 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-extrabold text-red-600 tracking-wider">
            {t('app_title')}
            <span className="block text-sm font-normal text-gray-500 -mt-1">
              {t('admin_panel')}
            </span>
          </h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <NavLink to="/admin/dashboard" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>
            <AdminDashboardIcon /> <span className="ml-4">{t('nav.admin_dashboard')}</span>
          </NavLink>
          <NavLink to="/admin/schedule" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>
            <ScheduleIcon /> <span className="ml-4">{t('nav.schedule')}</span>
          </NavLink>
          <NavLink to="/admin/reports" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>
            <ReportsIcon /> <span className="ml-4">{t('nav.reports')}</span>
          </NavLink>
          <NavLink to="/admin/generate-slots" className={navLinkClasses} onClick={() => setIsSidebarOpen(false)}>
            <SlotsIcon /> <span className="ml-4">{t('nav.generate_slots')}</span>
          </NavLink>
          {isSuperAdmin && (
            <>
              <button
                onClick={() => setIsSuperAdminMenuOpen(!isSuperAdminMenuOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-red-100 rounded-lg transition-colors duration-200 font-medium`}
              >
                <div className="flex items-center">
                  <ShieldIcon /> <span className="ml-4">{t('nav.superadmin')}</span>
                </div>
                {isSuperAdminMenuOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
              </button>
              {isSuperAdminMenuOpen && (
                <div className="mt-1 space-y-1">
                  <NavLink to="/admin/users" className={subNavLinkClasses} onClick={() => setIsSidebarOpen(false)}>
                    <UsersIcon /> <span className="ml-3">{t('superadmin.nav.users')}</span>
                  </NavLink>
                  <NavLink to="/admin/logs" className={subNavLinkClasses} onClick={() => setIsSidebarOpen(false)}>
                    <LogIcon /> <span className="ml-3">{t('nav.logs')}</span>
                  </NavLink>
                </div>
              )}
            </>
          )}

        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <button
            className="text-gray-600 md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <MenuIcon />
          </button>
          <div className="font-semibold text-gray-700 hidden md:block">
            {t('header.admin_view')}
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              <UserViewIcon />
              <span className="hidden sm:inline">{t('nav.user_view')}</span>
            </Link>
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
            >
              <LogoutIcon /> <span className="hidden sm:inline">{t('buttons.logout')}</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;

