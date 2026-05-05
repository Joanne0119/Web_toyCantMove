import React from 'react';
import { motion } from 'framer-motion';
import { teamMembers } from '@/constants/officialData';

const TeamCard = ({ member, index }) => {
  return (
    <motion.div
      className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300"
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <div className="card-body items-center text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3 overflow-hidden">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>
        <h3 className="card-title text-base">{member.name}</h3>
        <p className="text-xs text-primary font-medium">{member.role}</p>
        <p className="text-xs text-base-content/60 mt-1">{member.description}</p>
      </div>
    </motion.div>
  );
};

const TeamSection = () => {
  return (
    <section id="team" className="py-20 px-4 sm:px-8 lg:px-16 bg-base-200/50">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
          開發團隊
        </h2>
        <p className="text-base-content/60 text-center mb-12 max-w-xl mx-auto">
          一群熱愛遊戲的夥伴，攜手打造這個充滿童趣的體感派對遊戲
        </p>

        <div className="flex justify-center mb-8">
          <img src="/images/teamLogo_l .png" alt="Team Logo" className="w-28 h-auto opacity-80" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {teamMembers.map((member, i) => (
            <TeamCard key={member.id} member={member} index={i} />
          ))}
        </div>

        {/* Social links */}
        <motion.div
          className="flex justify-center mt-10"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="https://www.instagram.com/lets._.jam/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-base-200 hover:bg-primary/10 transition-colors !cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span className="text-sm font-medium">@lets._.jam</span>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TeamSection;
