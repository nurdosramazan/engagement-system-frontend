import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableSlots, bookAppointment } from '../../features/appointment/appointmentSlice';
import { fetchUserProfile } from '../../features/user/userSlice';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../../components/common/Modal';

const CalendarIcon = () => <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5 ml-2 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InfoIcon = () => <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>;
const AlertTriangleIcon = () => <svg className="h-5 w-5 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const BookAppointmentPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { availableSlots, status: appointmentStatus } = useSelector((state) => state.appointments);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const { uploadProgress } = useSelector((state) => state.appointments);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [hasAgreed, setHasAgreed] = useState(false);

    const [formData, setFormData] = useState({
        spouseFirstName: '',
        spouseLastName: '',
        witnesses: [
            { firstName: '', lastName: '', gender: 'MALE' },
            { firstName: '', lastName: '', gender: 'MALE' },
        ],
        notes: '',
        document: null,
    });

    const [formErrors, setFormErrors] = useState({});
    const fileInputRef = useRef(null);

    const MAX_NAME_LENGTH = 20;
    const MIN_NAME_LENGTH = 2;
    const MAX_NOTES_LENGTH = 500;
    const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

    useEffect(() => {
        const restoredData = location.state?.restoredBookingData;
        if (restoredData) {
            console.log("Restoring booking data:", restoredData);
            setFormData({
                spouseFirstName: restoredData.formData?.spouseFirstName || '',
                spouseLastName: restoredData.formData?.spouseLastName || '',
                witnesses: restoredData.formData?.witnesses || [],
                notes: restoredData.formData?.notes || '',
                document: null,
            });
            setSelectedSlot(restoredData.selectedSlot || null);
            if (restoredData.selectedSlot?.startTime) {
                const slotDate = new Date(restoredData.selectedSlot.startTime);
                setSelectedDate(slotDate);
                setCurrentMonth(startOfMonth(slotDate));
            }

            navigate('.', { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    useEffect(() => {
        dispatch(fetchUserProfile());
        if (!location.state?.restoredBookingData) {
            dispatch(fetchAvailableSlots({ year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 }));
        }
    }, [currentMonth, dispatch, location.state]);

    const validateForm = () => {
        const newErrors = {};
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ'][a-zA-Zа-яА-ЯёЁ' -]*$/;

        if (!formData.spouseFirstName?.trim() || formData.spouseFirstName.trim().length < MIN_NAME_LENGTH || formData.spouseFirstName.trim().length > MAX_NAME_LENGTH || !nameRegex.test(formData.spouseFirstName)) {
            newErrors.spouseFirstName = `First name must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} letters.`;
        }
        if (!formData.spouseLastName?.trim() || formData.spouseLastName.trim().length < MIN_NAME_LENGTH || formData.spouseLastName.trim().length > MAX_NAME_LENGTH || !nameRegex.test(formData.spouseLastName)) {
            newErrors.spouseLastName = `Last name must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} letters.`;
        }

        formData.witnesses.forEach((w, i) => {
            if (!w.firstName?.trim() || w.firstName.trim().length < MIN_NAME_LENGTH || w.firstName.trim().length > MAX_NAME_LENGTH || !nameRegex.test(w.firstName)) {
                newErrors[`witnessFirstName${i}`] = `First name must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} letters.`;
            }
            if (!w.lastName?.trim() || w.lastName.trim().length < MIN_NAME_LENGTH || w.lastName.trim().length > MAX_NAME_LENGTH || !nameRegex.test(w.lastName)) {
                newErrors[`witnessLastName${i}`] = `Last name must be ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} letters.`;
            }
        });

        if (!formData.document) {
            newErrors.document = "Document is required.";
        } else if (!ALLOWED_FILE_TYPES.includes(formData.document.type)) {
            newErrors.document = "Invalid file type (PDF, JPG, PNG only).";
        }

        if (formData.notes && formData.notes.length > MAX_NOTES_LENGTH) {
            newErrors.notes = `Notes cannot exceed ${MAX_NOTES_LENGTH} characters.`;
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleWitnessChange = (index, e) => {
        const { name, value } = e.target;
        const fieldName = name;
        const errorKey = `witness${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}${index}`;
        const updatedWitnesses = [...formData.witnesses];
        updatedWitnesses[index] = { ...updatedWitnesses[index], [name]: value };
        setFormData(prev => ({ ...prev, witnesses: updatedWitnesses }));

        if (formErrors[errorKey]) {
            setFormErrors(prev => ({ ...prev, [errorKey]: undefined }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setFormErrors(prev => ({ ...prev, document: "Invalid file type (PDF, JPG, PNG only)." }));
                e.target.value = null;
                setFormData(prev => ({ ...prev, document: null }));
            } else {
                setFormData(prev => ({ ...prev, document: file }));
                setFormErrors(prev => ({ ...prev, document: undefined }));
            }
        } else {
            setFormData(prev => ({ ...prev, document: null }));
        }
    };

    const addWitness = () => {
        if (formData.witnesses.length < 3) {
            setFormData(prev => ({
                ...prev,
                witnesses: [...prev.witnesses, { firstName: '', lastName: '', gender: 'FEMALE' }]
            }));
        }
    };

    const removeWitness = (index) => {
        const updatedWitnesses = formData.witnesses.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, witnesses: updatedWitnesses }));
    };

    const executeBooking = async () => {
        setFormErrors({});

        const data = new FormData();
        data.append('file', formData.document);

        const requestData = {
            timeSlotId: selectedSlot.id,
            spouseFirstName: formData.spouseFirstName.trim(),
            spouseLastName: formData.spouseLastName.trim(),
            witnesses: formData.witnesses.map(w => ({
                ...w,
                firstName: w.firstName.trim(),
                lastName: w.lastName.trim()
            })),
            notes: formData.notes.trim(),
        };
        data.append('request', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

        try {
            await dispatch(bookAppointment(data)).unwrap();
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error?.message || 'An unexpected error occurred.';
            const isProfileError = errorMessage.toLowerCase().includes('profile') || errorMessage.toLowerCase().includes('gender not provided');

            if (isProfileError) {
                toast.error('Your profile is incomplete. Please update it to continue.', { duration: 5000 });
                navigate('/profile', {
                    state: {
                        fromBooking: true,
                        bookingData: {
                            formData: {
                                spouseFirstName: formData.spouseFirstName,
                                spouseLastName: formData.spouseLastName,
                                witnesses: formData.witnesses,
                                notes: formData.notes,
                            },
                            selectedSlot: selectedSlot,
                        }
                    }
                });
            } else if (error?.fieldErrors) {
                toast.error(error.fieldErrors[0].defaultMessage || 'Please check the form data.');
                const backendErrors = {};
                error.fieldErrors.forEach(err => {
                    let key = err.field;
                    if (key.startsWith('witnesses')) {
                        const match = key.match(/witnesses\[(\d+)]\.(firstName|lastName)/);
                        if (match) key = `witness${match[2].charAt(0).toUpperCase() + match[2].slice(1)}${match[1]}`;
                    }
                    backendErrors[key] = err.defaultMessage;
                });
                setFormErrors(backendErrors);

            } else {
                toast.error(`Booking Failed: ${errorMessage}`);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});

        if (!selectedSlot) {
            toast.error('Please select an appointment time slot.');
            return;
        }
        if (!validateForm()) {
            toast.error('Please fix the errors in the form.');
            return;
        }

        setHasAgreed(false);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSubmit = (e) => {
        e.preventDefault();
        if (!hasAgreed) {
            toast.error('You must agree to the rules to continue.');
            return;
        }
        setIsConfirmModalOpen(false);
        executeBooking();
    };

    const changeMonth = (newMonth) => {
        setCurrentMonth(newMonth);
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const startingDayIndex = start.getDay();

    const slotsForSelectedDate = selectedDate ? availableSlots.filter(slot => isSameDay(new Date(slot.startTime), selectedDate)) : [];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Book an Appointment</h1>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">1. Select a Date & Time</h2>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => changeMonth(subMonths(currentMonth, 1))} className="px-2 py-1 rounded-md hover:bg-gray-100">&lt;</button>
                            <h3 className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
                            <button onClick={() => changeMonth(addMonths(currentMonth, 1))} className="px-2 py-1 rounded-md hover:bg-gray-100">&gt;</button>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-medium text-xs text-gray-500">{day}</div>)}
                            {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`}></div>)}
                            {daysInMonth.map(day => {
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isPastDay = isPast(day) && !isSameDay(day, new Date());
                                const hasSlots = availableSlots.some(slot => isSameDay(new Date(slot.startTime), day));

                                return (
                                    <button
                                        key={day.toString()}
                                        disabled={isPastDay || !hasSlots}
                                        onClick={() => setSelectedDate(day)}
                                        className={`w-10 h-10 rounded-full transition-colors duration-200 ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : ''
                                            } ${!isPastDay && hasSlots ? 'hover:bg-indigo-100' : ''
                                            } ${isPastDay || !hasSlots ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
                                            }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {selectedDate && (
                        <div>
                            <h3 className="font-semibold mb-3">Available Slots for {format(selectedDate, 'MMMM d, yyyy')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {slotsForSelectedDate.length > 0 ? slotsForSelectedDate.map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-3 rounded-lg border-2 transition-colors text-center font-medium ${selectedSlot?.id === slot.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white hover:bg-indigo-50 border-gray-200'}`}
                                    >
                                        {format(new Date(slot.startTime), 'h:mm a')}
                                    </button>
                                )) : <p className="col-span-3 text-sm text-gray-500">No available slots for this day.</p>}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`bg-white p-6 rounded-lg shadow-md transition-opacity duration-500 ${selectedSlot ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <h2 className="text-xl font-semibold mb-4">2. Provide Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 noValidate">
                        <div>
                            <h3 className="font-medium mb-2">Selected Appointment</h3>
                            {selectedSlot ? (
                                <div className="flex items-center bg-gray-100 p-3 rounded-lg text-gray-700">
                                    <CalendarIcon />
                                    <span className="font-semibold">{format(new Date(selectedSlot.startTime), 'MMMM d, yyyy')}</span>
                                    <ClockIcon />
                                    <span className="font-semibold">{format(new Date(selectedSlot.startTime), 'h:mm a')}</span>
                                </div>
                            ) : (
                                <div className="flex items-center bg-gray-100 p-3 rounded-lg text-gray-500">
                                    <p className="text-sm">Please select a date and time slot first.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Spouse's First Name</label>
                            <input type="text" name="spouseFirstName" value={formData.spouseFirstName} onChange={handleFormChange} required
                                className={`mt-1 block w-full px-3 py-2 border rounded-md ${formErrors.spouseFirstName ? 'border-red-500' : 'border-gray-300'}`} />
                            {formErrors.spouseFirstName && <p className="mt-1 text-xs text-red-500">{formErrors.spouseFirstName}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Spouse's Last Name</label>
                            <input type="text" name="spouseLastName" value={formData.spouseLastName} onChange={handleFormChange} required
                                className={`mt-1 block w-full px-3 py-2 border rounded-md ${formErrors.spouseLastName ? 'border-red-500' : 'border-gray-300'}`} />
                            {formErrors.spouseLastName && <p className="mt-1 text-xs text-red-500">{formErrors.spouseLastName}</p>}
                        </div>

                        <div>
                            <h3 className="font-medium mb-2">Witnesses</h3>
                            <div className="flex items-center bg-blue-50 text-blue-700 text-sm p-3 rounded-lg mb-3">
                                <InfoIcon />
                                <span>Must be 2 males, or 1 male and 2 females.</span>
                            </div>
                            {formData.witnesses.map((witness, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-3 border rounded-md relative">
                                    <div>
                                        <input type="text" name="firstName" placeholder="First Name" value={witness.firstName} onChange={e => handleWitnessChange(index, e)} required
                                            className={`block w-full px-3 py-2 border rounded-md ${formErrors[`witnessFirstName${index}`] ? 'border-red-500' : 'border-gray-300'}`} />
                                        {formErrors[`witnessFirstName${index}`] && <p className="mt-1 text-xs text-red-500">{formErrors[`witnessFirstName${index}`]}</p>}
                                    </div>
                                    <div>
                                        <input type="text" name="lastName" placeholder="Last Name" value={witness.lastName} onChange={e => handleWitnessChange(index, e)} required
                                            className={`block w-full px-3 py-2 border rounded-md ${formErrors[`witnessLastName${index}`] ? 'border-red-500' : 'border-gray-300'}`} />
                                        {formErrors[`witnessLastName${index}`] && <p className="mt-1 text-xs text-red-500">{formErrors[`witnessLastName${index}`]}</p>}
                                    </div>
                                    <select name="gender" value={witness.gender} onChange={e => handleWitnessChange(index, e)} required className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                    {index > 1 && (
                                        <button type="button" onClick={() => removeWitness(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">&times;</button>
                                    )}
                                </div>
                            ))}
                            {formData.witnesses.length < 3 && (
                                <button type="button" onClick={addWitness} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">+ Add a 3rd witness</button>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                            <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3" maxLength={MAX_NOTES_LENGTH}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md ${formErrors.notes ? 'border-red-500' : 'border-gray-300'}`}></textarea>
                            <p className={`text-xs text-right mt-1 ${formData.notes.length >= MAX_NOTES_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                                {MAX_NOTES_LENGTH - formData.notes.length} characters remaining
                            </p>
                            {formErrors.notes && <p className="mt-1 text-xs text-red-500">{formErrors.notes}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marriage Document (PDF, JPG, PNG)</label>
                            <div className="flex items-center bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg my-2 border border-yellow-200">
                                <AlertTriangleIcon />
                                <span className="ml-2">Please upload correctly. **You cannot change this file after submission.**</span>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} required accept=".pdf, image/jpeg, image/png"
                                className={`mt-1 block w-full text-sm rounded-md border p-2 ${formErrors.document ? 'border-red-500' : 'border-gray-300'} text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer`} />
                            {formData.document && <p className="mt-1 text-xs text-green-600">Selected: {formData.document.name}</p>}
                            {formErrors.document && <p className="mt-1 text-xs text-red-500">{formErrors.document}</p>}
                        </div>

                        {appointmentStatus === 'loading' && uploadProgress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full mt-4">
                                <div
                                    className="bg-indigo-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                >
                                    {uploadProgress}%
                                </div>
                            </div>
                        )}
                        <button type="submit" disabled={appointmentStatus === 'loading' || !selectedSlot} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold text-lg">
                            {appointmentStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                    <Modal
                        isOpen={isConfirmModalOpen}
                        onClose={() => setIsConfirmModalOpen(false)}
                        title="Confirm Your Booking"
                    >
                        <form onSubmit={handleConfirmSubmit}>
                            <div className="space-y-4">
                                <p>Please review your selection:</p>
                                <div className="p-4 bg-gray-100 rounded-md">
                                    <strong>Time:</strong>{' '}
                                    {selectedSlot ? format(new Date(selectedSlot.startTime), 'PPpp') : 'N/A'}
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Rules & Regulations</h4>
                                    <div className="h-32 overflow-y-auto border p-3 text-sm text-gray-600">
                                        <p>1. All attendees must arrive 15 minutes early.</p>
                                        <p>2. Valid identification is required for the couple and witnesses.</p>
                                        <p>3. Modest attire is mandatory within the mosque premises.</p>
                                        <p>4. The uploaded document must be the original, valid marriage permit.</p>
                                        <p>5. (Add more rules here...)</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="agreeRules"
                                        checked={hasAgreed}
                                        onChange={(e) => setHasAgreed(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="agreeRules" className="text-sm font-medium text-gray-700">
                                        I have read and agree to the rules and regulations.
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!hasAgreed}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-indigo-300"
                                >
                                    Confirm & Book
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentPage;

