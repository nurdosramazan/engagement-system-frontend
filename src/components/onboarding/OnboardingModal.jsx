import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../features/user/userSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const MaleIcon = () => (
    <svg className="w-16 h-16 mx-auto text-indigo-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const FemaleIcon = () => (
    <svg className="w-16 h-16 mx-auto text-pink-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6v1a6 6 0 01-6 6v-1a6 6 0 016-6h6v1a6 6 0 01-6 6zM12 4.354v5.292" />
    </svg>
);

const CheckIcon = () => (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const NameStep = ({ formData, setFormData, setStep }) => {
    const [error, setError] = useState('');
    const validate = () => {
        if (formData.firstName.trim().length < 2 || formData.lastName.trim().length < 2) {
            setError('First and last name must be at least 2 characters.');
            return false;
        }
        setError('');
        return true;
    };

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Name</h2>
            <p className="text-gray-600 mb-6">Please provide your full legal name.</p>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-3 border rounded-md"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-3 border rounded-md"
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
                onClick={() => validate() && setStep(2)}
                className="w-full bg-indigo-600 text-white py-3 rounded-md mt-6"
            >
                Next
            </button>
        </motion.div>
    );
};

const GenderStep = ({ formData, setFormData, setStep, handleSubmit }) => {
    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Gender</h2>
            <p className="text-gray-600 mb-6">This is required for the marriage certificate.</p>

            {/* --- NEW UI --- */}
            <div className="flex gap-4">
                {/* Male Card */}
                <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'MALE' })}
                    className={`relative flex-1 p-6 border-2 rounded-xl text-center cursor-pointer transition-all ${formData.gender === 'MALE' ? 'border-indigo-600 shadow-lg' : 'border-gray-300'
                        }`}
                    whileHover={{ scale: 1.03, y: -5 }} // Animate on hover
                    animate={formData.gender === 'MALE' ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    <MaleIcon />
                    <span className="font-semibold text-lg text-gray-800">Male</span>

                    {/* Animated checkmark */}
                    <AnimatePresence>
                        {formData.gender === 'MALE' && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0, rotate: 90 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-md"
                            >
                                <CheckIcon />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Female Card */}
                <motion.button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
                    className={`relative flex-1 p-6 border-2 rounded-xl text-center cursor-pointer transition-all ${formData.gender === 'FEMALE' ? 'border-pink-600 shadow-lg' : 'border-gray-300'
                        }`}
                    whileHover={{ scale: 1.03, y: -5 }} // Animate on hover
                    animate={formData.gender === 'FEMALE' ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                    <FemaleIcon />
                    <span className="font-semibold text-lg text-gray-800">Female</span>

                    {/* Animated checkmark */}
                    <AnimatePresence>
                        {formData.gender === 'FEMALE' && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, rotate: -90 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0, rotate: 90 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className="absolute top-3 right-3 w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center shadow-md"
                            >
                                <CheckIcon />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
            {/* --- END NEW UI --- */}

            <div className="flex gap-4 mt-8">
                <button
                    onClick={() => setStep(1)}
                    className="w-1/2 bg-gray-200 text-gray-800 py-3 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={handleSubmit}
                    className="w-1/2 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Save & Continue
                </button>
            </div>
        </motion.div>
    );
};

export const OnboardingModal = ({ profile, onClose }) => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        gender: profile.gender || 'MALE',
    });

    const handleSubmit = async () => {
        try {
            await dispatch(updateUserProfile(formData)).unwrap();
            toast.success('Profile updated!');
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to update profile.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    Skip for now
                </button>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <NameStep
                            key="step1"
                            formData={formData}
                            setFormData={setFormData}
                            setStep={setStep}
                        />
                    )}
                    {step === 2 && (
                        <GenderStep
                            key="step2"
                            formData={formData}
                            setFormData={setFormData}
                            setStep={setStep}
                            handleSubmit={handleSubmit}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};