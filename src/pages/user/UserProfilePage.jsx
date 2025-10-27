import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../../features/user/userSlice';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MaleIcon = () => (
    <svg className="w-12 h-12 mx-auto text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const FemaleIcon = () => (
    <svg className="w-12 h-12 mx-auto text-pink-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6v1a6 6 0 01-6 6v-1a6 6 0 016-6h6v1a6 6 0 01-6 6zM12 4.354v5.292" />
    </svg>
);
const CheckIcon = () => (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const UserProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { profile, status, error } = useSelector(state => state.user);
    const { user } = useSelector(state => state.auth);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'MALE',
    });
    const [initialLoad, setInitialLoad] = useState(true);
    const cameFromBooking = location.state?.fromBooking;
    const bookingDataToRestore = location.state?.bookingData;

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchUserProfile());
        }
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                gender: profile.gender || 'MALE',
            });
            setInitialLoad(false);
        }
    }, [dispatch, profile, status]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const resultActionPayload = await dispatch(updateUserProfile(formData)).unwrap();
            toast.success(resultActionPayload.message || 'Profile updated successfully!');
            if (cameFromBooking && bookingDataToRestore) {
                toast.success('Profile complete! Resuming booking...', { duration: 3000 });
                navigate('/book-appointment', {
                    state: { restoredBookingData: bookingDataToRestore }
                });
            }

        } catch (error) {
            if (error?.fieldErrors) {
                toast.error(error.fieldErrors[0].defaultMessage || 'Validation failed.');
            } else {
                toast.error(error?.message || 'Failed to update profile.');
            }
        }
    };

    if (initialLoad && status === 'loading') {
        return <p>Loading profile...</p>;
    }
    if (initialLoad && status === 'failed') {
        return <p className="text-red-500">Error loading profile: {error}</p>;
    }
    if (!profile && !initialLoad) {
        return <p className="text-red-500">Could not load profile data. Please try again later.</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
            {cameFromBooking && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 border border-yellow-200 rounded-md">
                    Please complete your profile details (First Name, Last Name, Gender) before booking an appointment.
                </div>
            )}
            <div className="max-w-xl bg-white p-8 rounded-lg shadow-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Phone Number (Login ID)
                        </label>
                        <input
                            type="text"
                            value={user?.phoneNumber || 'Loading...'}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <div className="flex gap-4">
                            <motion.button
                                type="button"
                                onClick={() => setFormData({ ...formData, gender: 'MALE' })}
                                className={`relative flex-1 p-4 border-2 rounded-xl text-center cursor-pointer transition-all ${formData.gender === 'MALE' ? 'border-indigo-600 shadow-lg' : 'border-gray-300'
                                    }`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <MaleIcon />
                                <span className="font-semibold text-gray-800">Male</span>
                                <AnimatePresence>
                                    {formData.gender === 'MALE' && (
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-md"
                                        >
                                            <CheckIcon />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
                                className={`relative flex-1 p-4 border-2 rounded-xl text-center cursor-pointer transition-all ${formData.gender === 'FEMALE' ? 'border-pink-600 shadow-lg' : 'border-gray-300'
                                    }`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <FemaleIcon />
                                <span className="font-semibold text-gray-800">Female</span>
                                <AnimatePresence>
                                    {formData.gender === 'FEMALE' && (
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            className="absolute top-2 right-2 w-5 h-5 bg-pink-600 rounded-full flex items-center justify-center shadow-md"
                                        >
                                            <CheckIcon />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                    {status === 'failed' && error && !error.fieldErrors && <p className="text-sm text-red-600">{error.message || error}</p>}
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                        {status === 'loading' ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfilePage;

