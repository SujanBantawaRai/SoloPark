import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import MultiInstituteSection from '../components/landing/MultiInstituteSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import Footer from '../components/landing/Footer';

const Home = () => {
    const { user } = useAuth();

    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-50">
            {/* The Navbar is already rendered in Layout.jsx above this. */}
            
            <main className="flex-grow flex flex-col">
                {/* 1. Hero Section */}
                <HeroSection user={user} />
                
                {/* 2. Multi-Institute Showcase */}
                <MultiInstituteSection />
                
                {/* 3. Core Features */}
                <FeaturesSection />
                
                {/* 4. Testimonials (Social Proof) */}
                <TestimonialsSection />
                

            </main>
            <Footer />
        </div>
    );
};

export default Home;
