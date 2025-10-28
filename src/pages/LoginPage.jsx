import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { requestOtp, verifyOtp, resetAuthStatus } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import OtpInput from 'react-otp-input';
import { Link } from 'react-router-dom';
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { useTranslation } from 'react-i18next';

const SpinnerIcon = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const buttonBaseStyle = "group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed";
const primaryButtonStyle = `${buttonBaseStyle} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`;
const successButtonStyle = `${buttonBaseStyle} bg-green-600 hover:bg-green-700 focus:ring-green-500`;
const linkButtonStyle = "font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400";
const secondaryLinkButtonStyle = "font-medium text-gray-600 hover:text-gray-900";


const CountdownTimer = ({ targetTime, onComplete, t }) => {
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

  return <span>{t('login.button_resend_in', { seconds: timeLeft })}</span>;
};

const LoginPage = () => {
  const { t } = useTranslation();
  const [countryCode, setCountryCode] = useState('+7');
  const [phoneNumber, setPhoneNumber] = useState('');
  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, otpMessage, usedChannel, lastOtpRequestTime } = useSelector((state) => state.auth);
  const errorMessage = error?.message;
  const [otpError, setOtpError] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState('KZ');
  const timerRef = useRef(null);


  const RESEND_WAIT_SECONDS = 120;
  const canResendAt = useMemo(() => {
    return lastOtpRequestTime ? lastOtpRequestTime + RESEND_WAIT_SECONDS * 1000 : 0;
  }, [lastOtpRequestTime]);
  const [canResend, setCanResend] = useState(true);


  const handleTimerComplete = useCallback(() => {
    setCanResend(true);
  }, []);

  useEffect(() => {
    const checkCanResend = () => {
      const now = Date.now();
      setCanResend(now >= canResendAt);
    };
    checkCanResend();

    if (Date.now() < canResendAt) {
      timerRef.current = setInterval(checkCanResend, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [canResendAt]);

  useEffect(() => {
    fetch('http://ip-api.com/json/?fields=countryCode')
      .then(response => response.json())
      .then(data => {
        if (data && data.countryCode) {
          setDefaultCountry(data.countryCode);
        }
      })
      .catch(error => {
        console.warn('Failed to fetch country from IP, defaulting to KZ.', error);
      });
  }, []);

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
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      toast.error(t('login.validation_invalid_phone'));
      return;
    }
    setCanResend(false);
    try {
      await dispatch(requestOtp(phoneNumber)).unwrap();
    } catch (rejectedValue) {
      const errorKey = rejectedValue?.message || 'errors.OTP_GENERIC_FAIL';
      const isRateLimit = errorKey === 'AUTH_RATE_LIMIT';
      const remainingSeconds = isRateLimit ? Math.max(0, Math.floor((canResendAt - Date.now()) / 1000)) : 0;
      toast.error(t(errorKey, { seconds: remainingSeconds }));

      if (!isRateLimit) {
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
    if (otpToVerify.length !== 6 || !phoneNumber) return;

    console.log('[LoginPage] Attempting to verify OTP...');
    try {
      const resultAction = await dispatch(verifyOtp({
        phoneNumber: phoneNumber,
        otp: otpToVerify,
        channel: usedChannel
      })).unwrap();

      console.log('[LoginPage] OTP Verification successful.');
      toast.success(t('api.login_success'));
      setOtpError(false);
      const decodedToken = jwtDecode(resultAction.token);
      const userRoles = decodedToken.roles || [];

      const targetPath = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_SUPERADMIN')
        ? '/admin/dashboard'
        : '/dashboard';

      console.log(`[LoginPage] Navigating to: ${targetPath}`);
      navigate(targetPath, { replace: true });
      console.log('[LoginPage] navigate() function called.');


    } catch (rejectedValue) {
      console.error('[LoginPage] OTP Verification failed:', rejectedValue);
      const errorKey = rejectedValue?.message || 'errors.AUTH_INVALID_OTP';
      toast.error(t(errorKey));
      setOtpError(true);
    }
  };

  const isLoading = status === 'loading' || status === 'verifying';
  const isOtpScreen = status === 'otp_requested' || (status === 'failed' && error?.isOtpError) || status === 'verifying';

  const remainingRateLimitSeconds = useMemo(() => {
    return Math.max(0, Math.floor((canResendAt - Date.now()) / 1000));
  }, [canResendAt, canResend]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 p-8 md:p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('login.title')}
          </h2>
        </div>
        {!isOtpScreen ? (
          <form onSubmit={handleRequestOtp} className="mt-8 space-y-6">
            <div>
              <label htmlFor="phone-number" className="sr-only">{t('login.phone_label')}</label>
              <PhoneInput
                id="phone-number"
                placeholder={t('login.phone_placeholder')}
                value={phoneNumber}
                onChange={setPhoneNumber}
                defaultCountry={defaultCountry}
                international
                withCountryCallingCode
                className="phone-input-container"
              />
            </div>
            {status === 'failed' && error?.message && !error?.isOtpError && !error?.isRateLimitError && (
              <p className="text-sm text-red-600 text-center">{t(error.message)}</p>
            )}
            <div>
              <button type="submit" disabled={isLoading || !canResend} className={primaryButtonStyle}>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isLoading && <SpinnerIcon />}
                </span>
                {isLoading ? t('login.button_sending') :
                  (canResend ? t('login.button_send_code') : t('login.button_resend_in', { seconds: remainingRateLimitSeconds }))}
              </button>
            </div>
            {status === 'failed' && error?.isRateLimitError && !canResend && (
              <p className="text-sm text-orange-600 text-center">
                {t('errors.AUTH_RATE_LIMIT', { seconds: remainingRateLimitSeconds })}
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">{t('login.otp_title')}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('login.otp_prompt', { phoneNumber: phoneNumber })}
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="sr-only">{t('login.otp_label')}</label>
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
            {status === 'failed' && error?.isOtpError && (
              <p className="text-sm text-red-600 text-center">{t(error.message || 'errors.AUTH_INVALID_OTP')}</p>
            )}

            <div>
              <button type="submit" disabled={isLoading || status === 'succeeded' || otp.length !== 6} className={successButtonStyle}>
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {status === 'verifying' && <SpinnerIcon />}
                </span>
                {status === 'verifying' ? t('login.button_verifying') : t('login.button_verify')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-sm space-y-2 sm:space-y-0 pt-2">
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={isLoading || !canResend}
                className={linkButtonStyle}
              >
                {isLoading ? t('login.button_sending') :
                  (canResend ? t('login.button_resend') : t('login.button_resend_in', { seconds: remainingRateLimitSeconds }))}</button>
              <button
                type="button"
                onClick={() => {
                  dispatch(resetAuthStatus());
                  setOtp('');
                  setPhoneNumber('');
                }}
                className={secondaryLinkButtonStyle}
              >
                {t('login.change_number_link')}
              </button>
            </div>
          </form>
        )}
        <div className="text-center text-sm">
          <Link
            to="/"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {t('login.back_home_link')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;