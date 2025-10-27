import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../../features/user/userSlice';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

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
            <div className="max-w-xl bg-white p-8 rounded-lg shadow-md">
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
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            id="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </select>
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

