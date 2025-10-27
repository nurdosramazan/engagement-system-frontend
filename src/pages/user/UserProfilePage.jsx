import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../../features/user/userSlice';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
    const dispatch = useDispatch();
    const { profile, status, error } = useSelector(state => state.user);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'MALE',
    });
    const [initialLoad, setInitialLoad] = useState(true);


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
        } catch (error) {
            if (error && error.fieldErrors && Array.isArray(error.fieldErrors) && error.fieldErrors.length > 0) {
                toast.error(error.fieldErrors[0].defaultMessage || error.message || 'Validation failed.');
            } else if (error && typeof error.message === 'string') {
                toast.error(error.message);
            } else if (typeof error === 'string') {
                toast.error(error);
            } else {
                toast.error('Failed to update profile.');
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
            <div className="max-w-xl bg-white p-8 rounded-lg shadow-md">
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
                    {status === 'failed' && error && (
                        <p className="text-sm text-red-600">
                            {typeof error === 'object' ? error.message : error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    >
                        {status === 'loading' ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserProfilePage;

