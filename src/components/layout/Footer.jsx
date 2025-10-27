import React from 'react';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/solid';

const Footer = () => {
    return (
        <footer className="w-full bg-gray-800 text-gray-300 p-6 mt-12">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h5 className="text-lg font-semibold text-white mb-2">Mosque Contact</h5>
                    <p className="text-sm">Astana Grand Mosque</p>
                    <p className="text-sm">123 Holy St, Astana, Kazakhstan</p>
                    <a
                        href="tel:+77771234567"
                        className="flex items-center gap-2 mt-2 hover:text-white"
                    >
                        <PhoneIcon className="w-4 h-4" /> +7 (777) 123-4567
                    </a>
                </div>
                <div>
                    <h5 className="text-lg font-semibold text-white mb-2">Technical Support</h5>
                    <p className="text-sm">For technical issues with the website:</p>
                    <a
                        href="mailto:your-dev-email@gmail.com"
                        className="flex items-center gap-2 mt-2 hover:text-white"
                    >
                        <EnvelopeIcon className="w-4 h-4" /> your-dev-email@gmail.com
                    </a>
                </div>
            </div>
            <div className="text-center text-gray-500 text-xs mt-8 pt-4 border-t border-gray-700">
                © {new Date().getFullYear()} Neke Booking. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;