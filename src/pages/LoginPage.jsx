import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp, resetAuthStatus } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import OtpInput from 'react-otp-input';

const PhoneIcon = () => <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 3a1 1 0 011-1h1.586a1 1 0 01.992.658l.128.513a1 1 0 01-.41 1.144l-.432.324a1 1 0 00-.472 1.33C4.694 8.21 7.79 11.306 9.876 12.31c.39.186.848.11 1.156-.226l.324-.432a1 1 0 011.144-.41l.513.128A1 1 0 0114.414 12H16a1 1 0 011 1v3.5a1 1 0 01-1 1A13.001 13.001 0 012 3.5a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const inputBaseStyle = "appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition duration-150 ease-in-out";
const buttonBaseStyle = "group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed";
const primaryButtonStyle = `${buttonBaseStyle} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`;
const successButtonStyle = `${buttonBaseStyle} bg-green-600 hover:bg-green-700 focus:ring-green-500`;
const linkButtonStyle = "font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400";
const secondaryLinkButtonStyle = "font-medium text-gray-600 hover:text-gray-900";

const validatePhoneNumber = (code, number) => {
  const codeRegex = /^\+\d{1,3}$/;
  const numberRegex = /^\d{7,12}$/;
  return codeRegex.test(code) && numberRegex.test(number);
};

const CountdownTimer = ({ targetTime, onComplete }) => {
  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const difference = targetTime - now;
    return Math.max(0, Math.floor(difference / 1000));
  }, [targetTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, calculateTimeLeft, onComplete]);

  return <span>{timeLeft}s</span>;
};

const LoginPage = () => {
  const [countryCode, setCountryCode] = useState('+7');
  const [phoneNumber, setPhoneNumber] = useState('');
  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, otpMessage, usedChannel, lastOtpRequestTime } = useSelector((state) => state.auth);
  const errorMessage = error?.message;
  const [otpError, setOtpError] = useState(false);

  const RESEND_WAIT_SECONDS = 120;
  const canResendAt = useMemo(() => {
    return lastOtpRequestTime ? lastOtpRequestTime + RESEND_WAIT_SECONDS * 1000 : 0;
  }, [lastOtpRequestTime]);
  const [canResend, setCanResend] = useState(Date.now() >= canResendAt);

  const handleTimerComplete = useCallback(() => {
    setCanResend(true);
  }, []);
  useEffect(() => {
    setCanResend(Date.now() >= canResendAt);
  }, [canResendAt]);

  useEffect(() => {
    dispatch(resetAuthStatus());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'otp_requested') {
      setOtpError(false);
    }
  }, [status]);

  const handleRequestOtp = async (e) => {
    e?.preventDefault();
    setOtpError(false);
    if (!validatePhoneNumber(countryCode, phoneNumber)) {
      toast.error('Please enter a valid phone number including country code.');
      return;
    }
    setCanResend(false);
    try {
      await dispatch(requestOtp(fullPhoneNumber)).unwrap();
    } catch (rejectedValue) {
      toast.error(rejectedValue?.message || 'Failed to send OTP.');
      if (!rejectedValue?.isRateLimitError) {
        setCanResend(true);
      }
    }
  };

  const handleOtpChange = (newOtp) => {
    setOtp(newOtp);
    setOtpError(false);
    if (newOtp.length === 6) {
      handleVerifyOtp(undefined, newOtp);
    }
  };

  const handleVerifyOtp = async (e, otpToVerify = otp) => {
    e?.preventDefault();
    if (otpToVerify.length !== 6 || !usedChannel) return;

    console.log('[LoginPage] Attempting to verify OTP...');
    try {
      const token = await dispatch(verifyOtp({
        phoneNumber: fullPhoneNumber,
        otp: otpToVerify,
        channel: usedChannel
      })).unwrap();

      console.log('[LoginPage] OTP Verification successful.');
      toast.success('Login successful!');
      setOtpError(false);
      const decodedToken = jwtDecode(token);
      const userRoles = decodedToken.roles || [];

      const targetPath = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_SUPERADMIN')
        ? '/admin/dashboard'
        : '/dashboard';

      console.log(`[LoginPage] Navigating to: ${targetPath}`);
      navigate(targetPath, { replace: true });
      console.log('[LoginPage] navigate() function called.');


    } catch (rejectedValue) {
      console.error('[LoginPage] OTP Verification failed:', rejectedValue);
      toast.error(rejectedValue?.message || 'Invalid or expired OTP.');
      setOtpError(true);
    }
  };

  const isLoading = status === 'loading' || status === 'verifying';
  const isOtpScreen = status === 'otp_requested' || (status === 'failed' && otpMessage) || status === 'verifying';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 p-8 md:p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {!isOtpScreen ? (
          <form onSubmit={handleRequestOtp} className="mt-8 space-y-6">
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="phone-number" className="sr-only">Phone Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                    <PhoneIcon />
                  </span>
                  <input
                    id="country-code"
                    name="country-code"
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value.startsWith('+') ? e.target.value : '+' + e.target.value)}
                    required
                    className={`${inputBaseStyle} rounded-r-none pl-10 w-24 text-center z-0`}
                    placeholder="+7"
                    aria-label="Country Code"
                  />
                  <input
                    id="phone-number"
                    name="phone-number"
                    type="tel"
                    autoComplete="tel-national"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    className={`${inputBaseStyle} rounded-l-none flex-1 z-0`}
                    placeholder="Phone Number"
                    aria-label="Phone Number"
                  />
                </div>
              </div>
            </div>
            {status === 'failed' && errorMessage && !otpMessage && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}
            <div>
              <button type="submit" disabled={isLoading || !canResend} className={primaryButtonStyle}>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isLoading && <SpinnerIcon />}
                </span>
                {isLoading ? 'Sending Code...' : (canResend ? 'Send Verification Code' : 'Resend Code in ')}
                {!isLoading && !canResend && <CountdownTimer targetTime={canResendAt} onComplete={handleTimerComplete} />}
              </button>
            </div>
            {status === 'failed' && error?.isRateLimitError && !canResend && (
              <p className="text-sm text-orange-600 text-center">
                {errorMessage} Try again in <CountdownTimer targetTime={canResendAt} onComplete={handleTimerComplete} />.
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">Enter Verification Code</h3>
              <p className="mt-2 text-sm text-gray-600">
                {otpMessage || `Enter the 6-digit code sent to ${fullPhoneNumber}.`}
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="sr-only">Verification Code</label>
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                numInputs={6}
                renderSeparator={<span className="mx-1 sm:mx-1.5"></span>}
                renderInput={(props, index) => <input {...props} key={index} />}
                inputStyle={`text-xl sm:text-2xl !w-10 h-12 sm:!w-12 sm:h-14 border-2 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${otpError ? 'border-red-500 ring-1 ring-red-500 caret-red-500' : 'border-gray-300 focus:border-indigo-500 caret-indigo-500'} transition duration-150 ease-in-out`}
                containerStyle="flex justify-center"
                shouldAutoFocus
              />
            </div>
            {status === 'failed' && errorMessage && otpMessage && (
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            )}

            <div>
              <button type="submit" disabled={isLoading || status === 'succeeded'} className={successButtonStyle}>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {status === 'verifying' && <SpinnerIcon />}
                </span>
                {status === 'verifying' ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-sm space-y-2 sm:space-y-0 pt-2">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading || !canResend}
                className={linkButtonStyle}
              >
                {isLoading ? 'Sending...' : (canResend ? 'Resend Code' : 'Resend Code in ')}
                {!isLoading && !canResend && <CountdownTimer targetTime={canResendAt} onComplete={handleTimerComplete} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(resetAuthStatus());
                  setOtp('');
                }}
                className={secondaryLinkButtonStyle}
              >
                Change phone number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;