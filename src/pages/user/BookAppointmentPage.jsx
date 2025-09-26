import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableSlots, bookAppointment } from '../../features/appointment/appointmentSlice';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CalendarIcon = () => <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InfoIcon = () => <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>;

const BookAppointmentPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { availableSlots, status: appointmentStatus } = useSelector((state) => state.appointments);
    const { profile } = useSelector((state) => state.user);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Form State
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

    useEffect(() => {
        dispatch(fetchAvailableSlots({ year: currentMonth.getFullYear(), month: currentMonth.getMonth() + 1 }));
    }, [currentMonth, dispatch]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleWitnessChange = (index, e) => {
        const { name, value } = e.target;
        const updatedWitnesses = [...formData.witnesses];
        updatedWitnesses[index] = { ...updatedWitnesses[index], [name]: value };
        setFormData(prev => ({ ...prev, witnesses: updatedWitnesses }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, document: e.target.files[0] }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!profile?.firstName || !profile?.lastName || !profile?.gender) {
            toast.error("Please complete your profile before booking an appointment.");
            navigate('/profile');
            return;
        }

        if (!selectedSlot) {
            toast.error("Please select a time slot.");
            return;
        }

        const data = new FormData();
        const request = {
            timeSlotId: selectedSlot.id,
            spouseFirstName: formData.spouseFirstName,
            spouseLastName: formData.spouseLastName,
            witnesses: formData.witnesses,
            notes: formData.notes,
        };
        data.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
        data.append('file', formData.document);

        try {
            await dispatch(bookAppointment(data)).unwrap();
            toast.success("Appointment booked successfully!");
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || "Failed to book appointment. You may already have a pending or approved appointment.");
        }
    };
    
    // Calendar Generation Logic
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const startingDayIndex = start.getDay(); // 0 for Sunday, 1 for Monday...

    const slotsForSelectedDate = selectedDate ? availableSlots.filter(slot => isSameDay(new Date(slot.startTime), selectedDate)) : [];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Book an Appointment</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Calendar & Slot Picker */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">1. Select a Date & Time</h2>
                    {/* Calendar */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="px-2 py-1 rounded-md hover:bg-gray-100">&lt;</button>
                            <h3 className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h3>
                            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="px-2 py-1 rounded-md hover:bg-gray-100">&gt;</button>
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
                                        className={`w-10 h-10 rounded-full transition-colors duration-200 ${
                                            isSelected ? 'bg-indigo-600 text-white' : ''
                                        } ${
                                            !isPastDay && hasSlots ? 'hover:bg-indigo-100' : ''
                                        } ${
                                            isPastDay || !hasSlots ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
                                        }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {/* Time Slots */}
                    {selectedDate && (
                         <div>
                            <h3 className="font-semibold mb-3">Available Slots for {format(selectedDate, 'MMMM d, yyyy')}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {slotsForSelectedDate.length > 0 ? slotsForSelectedDate.map(slot => (
                                    <button 
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-3 rounded-lg border-2 transition-colors ${selectedSlot?.id === slot.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-indigo-50 border-gray-200'}`}
                                    >
                                       {format(new Date(slot.startTime), 'h:mm a')}
                                    </button>
                                )) : <p className="col-span-3 text-sm text-gray-500">No available slots for this day.</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Appointment Details Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">2. Provide Details</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-2">Selected Appointment</h3>
                            {selectedSlot ? (
                                <div className="flex items-center bg-gray-100 p-3 rounded-lg">
                                    <CalendarIcon />
                                    <span>{format(new Date(selectedSlot.startTime), 'MMMM d, yyyy')}</span>
                                    <ClockIcon />
                                    <span>{format(new Date(selectedSlot.startTime), 'h:mm a')}</span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Please select a date and time slot first.</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Spouse's First Name</label>
                            <input type="text" name="spouseFirstName" value={formData.spouseFirstName} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Spouse's Last Name</label>
                            <input type="text" name="spouseLastName" value={formData.spouseLastName} onChange={handleFormChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>

                        <div>
                            <h3 className="font-medium mb-2">Witnesses</h3>
                             <div className="flex items-center bg-blue-50 text-blue-700 text-sm p-3 rounded-lg mb-3">
                                <InfoIcon />
                                <span>Must be 2 males, or 1 male and 2 females.</span>
                            </div>
                            {formData.witnesses.map((witness, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 p-3 border rounded-md relative">
                                    <input type="text" name="firstName" placeholder="First Name" value={witness.firstName} onChange={e => handleWitnessChange(index, e)} required className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                    <input type="text" name="lastName" placeholder="Last Name" value={witness.lastName} onChange={e => handleWitnessChange(index, e)} required className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                    <select name="gender" value={witness.gender} onChange={e => handleWitnessChange(index, e)} required className="block w-full px-3 py-2 border border-gray-300 rounded-md">
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
                            <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marriage Document (PDF, JPG, PNG)</label>
                            <input type="file" onChange={handleFileChange} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                        </div>

                        <button type="submit" disabled={appointmentStatus === 'loading'} className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold text-lg">
                            {appointmentStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookAppointmentPage;
