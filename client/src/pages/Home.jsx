import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LandingNav from '../components/landing/LandingNav';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const Home = () => {
    const { user } = useAuth();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col font-sans bg-white">
            {/* 1. Sticky Landing Navbar */}
            <LandingNav user={user} />

            <main className="flex-grow flex flex-col">
                {/* 2. Hero Section */}
                <HeroSection user={user} />

                {/* 3. Core Features */}
                <FeaturesSection />

                {/* 4. How It Works */}
                <HowItWorksSection />

                {/* 5. Testimonials */}
                <TestimonialsSection />

                {/* 6. Call to Action */}
                <CTASection />
            </main>

            <Footer />
        </div>
    );
};

export default Home;
