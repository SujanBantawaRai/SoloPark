import React from 'react';

const SoloParkLogo = ({ className = 'w-8 h-8', showText = false, textClass = 'text-[17px]', lightText = false }) => {
    return (
        <div className="inline-flex items-center gap-2.5 group">
            {/* Custom 3D Isometric Logo Icon */}
            <svg
                className={`${className} transition-transform duration-300 group-hover:scale-105`}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Gradients for Left and Right faces */}
                    <linearGradient id="logoLeftFace" x1="50" y1="55" x2="15" y2="75" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="logoRightFace" x1="50" y1="55" x2="85" y2="75" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>

                {/* 1. FRONT-LEFT FACE (with stylized "P") */}
                <path
                    d="M 15 35 L 50 55 L 50 95 L 15 75 Z"
                    fill="url(#logoLeftFace)"
                />
                
                {/* Stylized White "P" on Front-Left Face */}
                {/* Stem of P */}
                <path
                    d="M 23 50 L 29 53.4 L 29 80 L 23 76.6 Z"
                    fill="#FFFFFF"
                    opacity="0.95"
                />
                {/* Loop of P */}
                <path
                    d="M 29 53.4 C 36 57.4 39 60 41 62 C 43 64 43 67 41 69 C 39 71 36 72.5 29 68.5 L 29 61.5 C 33 63.8 35 64.5 36 63.5 C 37 62.5 35 61 29 57.6 Z"
                    fill="#FFFFFF"
                    opacity="0.95"
                />

                {/* 2. FRONT-RIGHT FACE (Solid Gradient) */}
                <path
                    d="M 50 55 L 85 35 L 85 75 L 50 95 Z"
                    fill="url(#logoRightFace)"
                />

                {/* 3. TOP FACE (White with Parking Slot and Car) */}
                <path
                    d="M 50 15 L 85 35 L 50 55 L 15 35 Z"
                    fill="#FFFFFF"
                />

                {/* Parking Boundary Lines (White/Light Blue) */}
                <path
                    d="M 32 29 L 52 40.5"
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <path
                    d="M 48 20 L 68 31.5"
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />

                {/* Isometric Blue Car Shape */}
                {/* Shadow */}
                <ellipse cx="50" cy="31" rx="9" ry="4" fill="#1e3a8a" opacity="0.15" transform="rotate(15 50 31)" />
                {/* Car Main Body */}
                <path
                    d="M 39 31 C 39 29.5 41 28 44 29 C 47 30 54 33.5 56 34.5 C 57.5 35.2 57 37 55 37.5 C 53 38 46 34.5 44 33.5 C 41 32 39 32.5 39 31 Z"
                    fill="#2563eb"
                />
                {/* Car Cabin/Roof */}
                <path
                    d="M 43 30.2 C 44 29.2 46 29 48 30 C 50 31 53 32.5 53 33.5 C 53 34.2 52 35 50 34 C 48 33 45 31.5 43 30.2 Z"
                    fill="#60a5fa"
                />
                {/* Wheels (Isometric Ellipses) */}
                <ellipse cx="44" cy="34" rx="2.5" ry="1.5" fill="#1e293b" />
                <ellipse cx="52" cy="38" rx="2.5" ry="1.5" fill="#1e293b" />
            </svg>

            {/* Optional Logo text styled exactly like the reference image */}
            {showText && (
                <span className={`${textClass} font-black tracking-tight flex items-center`}>
                    <span className={lightText ? 'text-white' : 'text-slate-800'}>Solo</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                        Park
                    </span>
                </span>
            )}
        </div>
    );
};

export default SoloParkLogo;
