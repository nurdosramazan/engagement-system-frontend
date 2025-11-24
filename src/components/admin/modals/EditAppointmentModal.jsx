import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateAppointmentDetails } from '../../../features/admin/adminSlice';
import toast from 'react-hot-toast';
import { isPast } from 'date-fns';


const EditAppointmentModal = ({ appointment, isOpen, onClose, t }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const toInputDate = (dateVal) => {
        if (!dateVal) return '';
        if (Array.isArray(dateVal)) {
            const y = dateVal[0];
            const m = String(dateVal[1]).padStart(2, '0');
            const d = String(dateVal[2]).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return String(dateVal).split('T')[0];
    };

    const [formData, setFormData] = useState({
        groomFirstName: '',
        groomLastName: '',
        groomDateOfBirth: '',
        groomOrigin: '',
        groomPhoneNumber: '',
        brideFirstName: '',
        brideLastName: '',
        brideDateOfBirth: '',
        brideOrigin: '',
        bridePhoneNumber: '',
        witnesses: []
    });

    useEffect(() => {
        if (appointment && isOpen) {
            setFormData({
                groomFirstName: appointment.groomFirstName || '',
                groomLastName: appointment.groomLastName || '',
                groomDateOfBirth: toInputDate(appointment.groomDateOfBirth),
                groomOrigin: appointment.groomOrigin || '',
                groomPhoneNumber: appointment.groomPhoneNumber || '',
                brideFirstName: appointment.brideFirstName || '',
                brideLastName: appointment.brideLastName || '',
                brideDateOfBirth: toInputDate(appointment.brideDateOfBirth),
                brideOrigin: appointment.brideOrigin || '',
                bridePhoneNumber: appointment.bridePhoneNumber || '',
                witnesses: [
                    {
                        firstName: appointment.witness1FirstName || '',
                        lastName: appointment.witness1LastName || '',
                        gender: 'MALE'
                    },
                    {
                        firstName: appointment.witness2FirstName || '',
                        lastName: appointment.witness2LastName || '',
                        gender: 'MALE'
                    },
                    ...(appointment.witness3FirstName ? [{
                        firstName: appointment.witness3FirstName,
                        lastName: appointment.witness3LastName,
                        gender: 'FEMALE'
                    }] : [])
                ]
            });
        }
    }, [appointment, isOpen]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formErrors[e.target.name]) setFormErrors({ ...formErrors, [e.target.name]: null });
    };

    const handleWitnessChange = (index, field, value) => {
        const newWitnesses = [...formData.witnesses];
        newWitnesses[index][field] = value;
        setFormData({ ...formData, witnesses: newWitnesses });
        const errorKey = `witness${field.charAt(0).toUpperCase() + field.slice(1)}${index}`;
        if (formErrors[errorKey]) setFormErrors({ ...formErrors, [errorKey]: null });
        if (formErrors.witnessLogic) setFormErrors({ ...formErrors, witnessLogic: null });
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
        if (index === 2) {
            setFormData(prev => ({
                ...prev,
                witnesses: prev.witnesses.filter((_, i) => i !== index)
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        const nameRegex = /^[a-zA-Zа-яА-ЯёЁ'][a-zA-Zа-яА-ЯёЁ' -]*$/;
        const phoneRegex = /^\+[1-9]\d{7,14}$/;
        const nameParams = { min: 2, max: 20 };

        if (formData.groomOrigin.length > 30) errors.groomOrigin = t('booking.validation.origin_length');
        if (!phoneRegex.test(formData.groomPhoneNumber)) errors.groomPhoneNumber = t('booking.validation.invalid_phone');

        if (!formData.groomDateOfBirth) errors.groomDateOfBirth = t('booking.validation.required');
        else if (!isPast(new Date(formData.groomDateOfBirth))) errors.groomDateOfBirth = t('booking.validation.date_past');

        if (!formData.groomFirstName || formData.groomFirstName.length < 2 || !nameRegex.test(formData.groomFirstName)) {
            errors.groomFirstName = t('booking.validation.name_length', { ...nameParams, field: t('admin_dashboard.details.label_name') });
        }
        if (!formData.groomLastName || formData.groomLastName.length < 2 || !nameRegex.test(formData.groomLastName)) {
            errors.groomLastName = t('booking.validation.name_length', { ...nameParams, field: t('admin_dashboard.details.label_name') });
        }

        if (formData.brideOrigin.length > 30) errors.brideOrigin = t('booking.validation.origin_length');
        if (!phoneRegex.test(formData.bridePhoneNumber)) errors.bridePhoneNumber = t('booking.validation.invalid_phone');

        if (!formData.brideDateOfBirth) errors.brideDateOfBirth = t('booking.validation.required');
        else if (!isPast(new Date(formData.brideDateOfBirth))) errors.brideDateOfBirth = t('booking.validation.date_past');

        if (!formData.brideFirstName || formData.brideFirstName.length < 2 || !nameRegex.test(formData.brideFirstName)) {
            errors.brideFirstName = t('booking.validation.name_length', { ...nameParams, field: t('admin_dashboard.details.label_name') });
        }
        if (!formData.brideLastName || formData.brideLastName.length < 2 || !nameRegex.test(formData.brideLastName)) {
            errors.brideLastName = t('booking.validation.name_length', { ...nameParams, field: t('admin_dashboard.details.label_name') });
        }

        let maleCount = 0;
        let femaleCount = 0;

        formData.witnesses.forEach((w, i) => {
            if (!w.firstName || w.firstName.trim().length < 2 || !nameRegex.test(w.firstName)) {
                errors[`witnessFirstName${i}`] = t('booking.validation.name_length', { ...nameParams, field: `Witness ${i + 1}` });
            }
            if (!w.lastName || w.lastName.trim().length < 2 || !nameRegex.test(w.lastName)) {
                errors[`witnessLastName${i}`] = t('booking.validation.name_length', { ...nameParams, field: `Witness ${i + 1}` });
            }
            if (w.gender === 'MALE') maleCount++;
            if (w.gender === 'FEMALE') femaleCount++;
        });

        const isTwoMales = maleCount === 2 && femaleCount === 0;
        const isOneMaleTwoFemales = maleCount === 1 && femaleCount === 2;
        if (!(isTwoMales || isOneMaleTwoFemales)) {
            errors.witnessLogic = t('errors.INVALID_WITNESSES');
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});

        if (!validateForm()) {
            toast.error(t('booking.validation.fix_errors'));
            return;
        }
        setIsLoading(true);

        try {
            await dispatch(updateAppointmentDetails({ id: appointment.id, data: formData })).unwrap();
            toast.success(t('api.appointment_details_updated'));
            onClose();
        } catch (error) {
            if (error?.fieldErrors) {
                const newBackendErrors = {};
                error.fieldErrors.forEach(err => {
                    let key = err.field;
                    if (key.startsWith('witnesses')) {
                        const match = key.match(/witnesses\[(\d+)]\.(firstName|lastName)/);
                        if (match) {
                            key = `witness${match[2].charAt(0).toUpperCase() + match[2].slice(1)}${match[1]}`;
                        }
                    }
                    newBackendErrors[key] = err.defaultMessage;
                });
                setFormErrors(newBackendErrors);
                toast.error(t('booking.validation.fix_errors'));
            } else {
                const msg = error?.message || 'update_failed';
                const cleanMsg = msg.startsWith('errors.') ? msg.replace('errors.', '') : msg;
                toast.error(t(`errors.${cleanMsg}`));
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;
    const getInputClass = (fieldName) => `border p-2 rounded w-full ${formErrors[fieldName] ? 'border-red-500 bg-red-50' : 'border-gray-300'}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{t('admin_dashboard.edit.title')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-sm text-yellow-700">
                    {t('admin_dashboard.edit.warning')}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-3">{t('admin_dashboard.details.section_groom')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_name')}</label>
                                <input name="groomFirstName" value={formData.groomFirstName} onChange={handleChange} className={getInputClass('groomFirstName')} placeholder={t('admin_dashboard.details.label_name')} required />
                                {formErrors.groomFirstName && <p className="text-xs text-red-500">{formErrors.groomFirstName}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_name')} (Last)</label>
                                <input name="groomLastName" value={formData.groomLastName} onChange={handleChange} className={getInputClass('groomLastName')} placeholder={t('admin_dashboard.details.label_name')} required />
                                {formErrors.groomLastName && <p className="text-xs text-red-500">{formErrors.groomLastName}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_dob')}</label>
                                <input name="groomDateOfBirth" type="date" value={formData.groomDateOfBirth} onChange={handleChange} className={getInputClass('groomDateOfBirth')} required />
                                {formErrors.groomDateOfBirth && <p className="text-xs text-red-500">{formErrors.groomDateOfBirth}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_origin')}</label>
                                <input name="groomOrigin" value={formData.groomOrigin} onChange={handleChange} className={getInputClass('groomOrigin')} placeholder={t('admin_dashboard.details.label_origin')} required />
                                {formErrors.groomOrigin && <p className="text-xs text-red-500">{formErrors.groomOrigin}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_phone')}</label>
                                <input name="groomPhoneNumber" value={formData.groomPhoneNumber} onChange={handleChange} className={getInputClass('groomPhoneNumber')} placeholder={t('admin_dashboard.details.label_phone')} required />
                                {formErrors.groomPhoneNumber && <p className="text-xs text-red-500">{formErrors.groomPhoneNumber}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-pink-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-pink-800 mb-3">{t('admin_dashboard.details.section_bride')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_name')}</label>
                                <input name="brideFirstName" value={formData.brideFirstName} onChange={handleChange} className={getInputClass('brideFirstName')} placeholder={t('admin_dashboard.details.label_name')} required />
                                {formErrors.brideFirstName && <p className="text-xs text-red-500">{formErrors.brideFirstName}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_name')} (Last)</label>
                                <input name="brideLastName" value={formData.brideLastName} onChange={handleChange} className={getInputClass('brideLastName')} placeholder={t('admin_dashboard.details.label_name')} required />
                                {formErrors.brideLastName && <p className="text-xs text-red-500">{formErrors.brideLastName}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_dob')}</label>
                                <input name="brideDateOfBirth" type="date" value={formData.brideDateOfBirth} onChange={handleChange} className={getInputClass('brideDateOfBirth')} required />
                                {formErrors.brideDateOfBirth && <p className="text-xs text-red-500">{formErrors.brideDateOfBirth}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_origin')}</label>
                                <input name="brideOrigin" value={formData.brideOrigin} onChange={handleChange} className={getInputClass('brideOrigin')} placeholder={t('admin_dashboard.details.label_origin')} required />
                                {formErrors.brideOrigin && <p className="text-xs text-red-500">{formErrors.brideOrigin}</p>}
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{t('admin_dashboard.details.label_phone')}</label>
                                <input name="bridePhoneNumber" value={formData.bridePhoneNumber} onChange={handleChange} className={getInputClass('bridePhoneNumber')} placeholder={t('admin_dashboard.details.label_phone')} required />
                                {formErrors.bridePhoneNumber && <p className="text-xs text-red-500">{formErrors.bridePhoneNumber}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-3">{t('booking.form.witnesses_title')}</h3>
                        {formData.witnesses.map((w, i) => (
                            <div key={i} className="flex gap-2 mb-2 items-start">
                                <span className="pt-2 text-sm font-bold text-gray-500 w-6">{i + 1}.</span>
                                <div className="w-full">
                                    <div className="flex gap-2">
                                        <input value={w.firstName} onChange={(e) => handleWitnessChange(i, 'firstName', e.target.value)} className={getInputClass(`witnessFirstName${i}`)} placeholder={t('booking.form.witness_first_name_placeholder')} required />
                                        <input value={w.lastName} onChange={(e) => handleWitnessChange(i, 'lastName', e.target.value)} className={getInputClass(`witnessLastName${i}`)} placeholder={t('booking.form.witness_last_name_placeholder')} required />
                                        <select value={w.gender} onChange={(e) => handleWitnessChange(i, 'gender', e.target.value)} className="border p-2 rounded w-32 text-sm">
                                            <option value="MALE">{t('booking.form.gender_male')}</option>
                                            <option value="FEMALE">{t('booking.form.gender_female')}</option>
                                        </select>
                                        {i === 2 && (
                                            <button type="button" onClick={() => removeWitness(i)} className="text-red-500 font-bold px-2 self-center">X</button>
                                        )}</div>
                                    {(formErrors[`witnessFirstName${i}`] || formErrors[`witnessLastName${i}`]) && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {formErrors[`witnessFirstName${i}`] || formErrors[`witnessLastName${i}`]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {formData.witnesses.length < 3 && (
                            <button type="button" onClick={addWitness} className="mt-2 text-sm text-indigo-600 font-medium hover:text-indigo-800">
                                {t('booking.form.add_witness')}
                            </button>
                        )}
                        {formErrors.witnessLogic && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                                {formErrors.witnessLogic}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">{t('buttons.cancel')}</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                            {isLoading ? 'Saving...' : t('admin_dashboard.edit.save')}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
};

export default EditAppointmentModal;