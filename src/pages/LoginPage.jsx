import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('+1');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.auth);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      await dispatch(requestOtp(phoneNumber)).unwrap();
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    } catch (error) {
      toast.error('Failed to send OTP. Please check the number.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await dispatch(verifyOtp({ phoneNumber, otp })).unwrap();
      toast.success('Login successful!');
      
      const userRoles = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).roles;
      if (userRoles.includes('ROLE_ADMIN')) {
          navigate('/admin/dashboard');
      } else {
          navigate('/dashboard');
      }
      
    } catch (error) {
      toast.error('Invalid or expired OTP.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Engagement System Login</h1>
        {!otpSent ? (
          <form onSubmit={handleRequestOtp}>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="+1234567890"
              required
            />
            <button type="submit" disabled={status === 'loading'} className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
              {status === 'loading' ? 'Sending...' : 'Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              maxLength="6"
              required
            />
            <button type="submit" disabled={status === 'loading'} className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300">
              {status === 'loading' ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;