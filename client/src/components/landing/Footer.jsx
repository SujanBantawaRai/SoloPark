import React from 'react';
import { Link } from 'react-router-dom';
import { FaParking, FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 pt-8 pb-4">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-7">
                    {/* Brand Column */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2.5 mb-3">
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-1.5 shadow-lg shadow-blue-500/20">
                                <FaParking className="text-base text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                SoloPark
                            </span>
                        </Link>
                        <p className="text-slate-400 leading-relaxed mb-3 font-light text-sm">
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

                    {/* Links Column 1 */}
                    <div>
                        <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-xs">Product</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Features</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Security</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Multi-Institute</a></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-xs">Resources</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Documentation</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Help Center</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">API Reference</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div>
                        <h4 className="text-white font-bold mb-2 uppercase tracking-wider text-xs">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Terms of Service</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Privacy Policy</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">Cookie Policy</a></li>
                        </ul>
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
