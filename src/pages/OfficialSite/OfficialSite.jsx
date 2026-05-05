import React, { useEffect } from 'react';
import './OfficialSite.css';
import OfficialNavbar from '@/components/official/OfficialNavbar';
import HeroSection from '@/components/official/HeroSection';
import AboutSection from '@/components/official/AboutSection';
import CharactersSection from '@/components/official/CharactersSection';
import LevelsSection from '@/components/official/LevelsSection';
import GameplaySection from '@/components/official/GameplaySection';
import TechSection from '@/components/official/TechSection';
import TeamSection from '@/components/official/TeamSection';
import OfficialFooter from '@/components/official/OfficialFooter';

const OfficialSite = () => {
  // Toggle body class for scroll override
  useEffect(() => {
    document.body.classList.add('official-page');
    return () => {
      document.body.classList.remove('official-page');
    };
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      <OfficialNavbar />
      <main>
        <HeroSection />
        <AboutSection />
        <CharactersSection />
        <LevelsSection />
        <GameplaySection />
        <TechSection />
        <TeamSection />
      </main>
      <OfficialFooter />
    </div>
  );
};

export default OfficialSite;
