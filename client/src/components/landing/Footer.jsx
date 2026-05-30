import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';
import SoloParkLogo from './SoloParkLogo';

const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-8 pb-4">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center text-center max-w-xl mx-auto mb-7">
                    <Link to="/" className="flex items-center mb-3">
                        <SoloParkLogo showText={true} className="w-8 h-8" textClass="text-[17px]" lightText={true} />
                    </Link>
                    <p className="text-slate-400 leading-relaxed mb-4 font-light text-sm">
                        Revolutionizing campus parking management with smart, scalable, and intuitive technology.
                    </p>
                    <div className="flex space-x-3">
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                            <FaTwitter />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                            <FaLinkedin />
                        </a>
                        <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                            <FaGithub />
                        </a>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-xs mb-2 md:mb-0">
                        &copy; {new Date().getFullYear()} SoloPark Campus Parking Systems. All rights reserved.
                    </p>
                    <div className="flex items-center text-slate-500 text-xs">
                        <FaEnvelope className="mr-1.5" />
                        hello@solopark.com
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
