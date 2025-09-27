import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../../features/user/userSlice';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
    const dispatch = useDispatch();
    const { profile, status } = useSelector((state) => state.user);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'MALE',
    });

    useEffect(() => {
        // Fetch the user's profile when the component loads
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        // When the profile data is loaded from the API, update the form
        if (profile) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                gender: profile.gender || 'MALE',
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updateUserProfile(formData)).unwrap();
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile.');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
            <div className="max-w-2xl bg-white p-8 rounded-lg shadow-md">
                {status === 'loading' && !profile ? (
                    <p>Loading your profile...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold"
                        >
                            {status === 'loading' ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfilePage;

