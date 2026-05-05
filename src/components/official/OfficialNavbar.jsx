import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { navLinks } from '@/constants/officialData';

// Hamburger ☰ ↔ X animated icon
const MenuToggle = ({ isOpen, onClick }) => (
  <button onClick={onClick} className="relative w-8 h-8 flex items-center justify-center cursor-pointer z-[60]">
    <svg width="24" height="24" viewBox="0 0 24 24" className="stroke-current">
      {/* Top line → top-left of X */}
      <motion.line
        x1="4" y1="6" x2="20" y2="6"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isOpen ? { x1: 6, y1: 6, x2: 18, y2: 18 } : { x1: 4, y1: 6, x2: 20, y2: 6 }}
        transition={{ duration: 0.3 }}
      />
      {/* Middle line → fade out */}
      <motion.line
        x1="4" y1="12" x2="20" y2="12"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      {/* Bottom line → bottom-left of X */}
      <motion.line
        x1="4" y1="18" x2="20" y2="18"
        strokeWidth="2"
        strokeLinecap="round"
        animate={isOpen ? { x1: 6, y1: 18, x2: 18, y2: 6 } : { x1: 4, y1: 18, x2: 20, y2: 18 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  </button>
);

const OfficialNavbar = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Lock body scroll when fullscreen menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY < lastScrollY.current || currentScrollY < 100);
      setIsScrolled(currentScrollY > 50);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    );

    navLinks.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    // Small delay so the menu closes first, then scroll
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isVisible || menuOpen ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled && !menuOpen
            ? 'bg-base-100/80 backdrop-blur-lg shadow-lg'
            : 'bg-base-100/50 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer z-[60]"
            >
              <img src="/images/logo.png" alt="Logo" className="h-8 w-8" />
              <span className="font-bold text-lg hidden sm:block">不會動的玩具才正常吧</span>
            </button>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeSection === id
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => navigate('/enter-name')}
                className="btn btn-primary btn-sm ml-3 cursor-pointer"
              >
                開始遊戲
              </button>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center gap-2">
              <MenuToggle isOpen={menuOpen} onClick={() => setMenuOpen(!menuOpen)} />
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-base-100 flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map(({ id, label }, i) => (
              <motion.button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`text-2xl font-bold cursor-pointer transition-colors ${
                  activeSection === id
                    ? 'text-primary'
                    : 'text-base-content/70 hover:text-primary'
                }`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                {label}
              </motion.button>
            ))}

            <motion.button
              onClick={() => { setMenuOpen(false); navigate('/enter-name'); }}
              className="btn btn-primary btn-lg mt-4 cursor-pointer"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.3, delay: navLinks.length * 0.05 }}
            >
              開始遊戲
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfficialNavbar;
