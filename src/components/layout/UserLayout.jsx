import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import NotificationBell from '../notifications/NotificationBell';
import { fetchUserProfile } from '../../features/user/userSlice';
import { OnboardingModal } from '../../components/onboarding/OnboardingModal';
import { AnimatePresence } from 'framer-motion';
import Footer from '../layout/Footer';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';

const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const CalendarIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const UserIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const AdminIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


const UserLayout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes('ADMIN');
  const { profile, status } = useSelector((state) => state.user);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (profile && (!profile.firstName || !profile.lastName || !profile.gender)) {
      setShowOnboarding(true);
    }
  }, [profile]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-100 rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-100 text-indigo-700 font-bold' : 'font-medium'
    }`;

  const bottomNavLinkClasses = ({ isActive }) =>
    `flex flex-col items-center justify-center p-3 w-full transition-colors duration-200 ${isActive
      ? 'text-indigo-600'
      : 'text-gray-500 hover:text-indigo-500'
    }`;

  return (
    <div className="relative min-h-screen md:flex">
      <aside className="hidden md:block bg-white shadow-lg w-64">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-extrabold text-indigo-600 tracking-wider">{t('app_title')}</h1>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <NavLink to="/dashboard" className={navLinkClasses}> <DashboardIcon /> <span className="ml-4">{t('nav.dashboard')}</span> </NavLink>
          <NavLink to="/book-appointment" className={navLinkClasses}> <CalendarIcon /> <span className="ml-4">{t('nav.book')}</span> </NavLink>
          <NavLink to="/profile" className={navLinkClasses}> <UserIcon /> <span className="ml-4">{t('nav.profile')}</span> </NavLink>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
          <div className="font-semibold text-gray-700">{t('app_title')}</div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {isAdmin && (
              <Link to="/admin/dashboard" className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-semibold">
                <AdminIcon /> <span className="hidden sm:inline">{t('nav.admin_panel')}</span>
              </Link>
            )}
            <NotificationBell />
            <button onClick={handleLogout} className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
              <LogoutIcon /> <span className="hidden sm:inline">{t('buttons.logout')}</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-gray-50 pb-24 md:pb-8">
          <Outlet />
        </main>
        <Footer />
        <AnimatePresence>
          {showOnboarding && profile && (
            <OnboardingModal
              profile={profile}
              onClose={() => setShowOnboarding(false)}
            />
          )}
        </AnimatePresence>
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 flex justify-around z-20">
          <NavLink to="/dashboard" className={bottomNavLinkClasses}>
            <DashboardIcon />
            <span className="text-xs mt-1">{t('nav.dashboard')}</span>
          </NavLink>
          <NavLink to="/book-appointment" className={bottomNavLinkClasses}>
            <CalendarIcon />
            <span className="text-xs mt-1">{t('nav.book_short')}</span>
          </NavLink>
          <NavLink to="/profile" className={bottomNavLinkClasses}>
            <UserIcon />
            <span className="text-xs mt-1">{t('nav.profile_short')}</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default UserLayout;

