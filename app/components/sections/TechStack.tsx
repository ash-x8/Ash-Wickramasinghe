'use client';

import { motion } from 'framer-motion';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiFirebase,
  SiPython,
  SiPostgresql,
  SiDocker,
  SiGit,
  SiNodedotjs,
} from 'react-icons/si';

const techStack = [
  { name: 'React', icon: SiReact, color: '#61dafb' },
  { name: 'Next.js', icon: SiNextdotjs, color: '#ffffff' },
  { name: 'TypeScript', icon: SiTypescript, color: '#3178c6' },
  { name: 'Tailwind CSS', icon: SiTailwindcss, color: '#06b6d4' },
  { name: 'Firebase', icon: SiFirebase, color: '#ffa726' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#68a063' },
  { name: 'PostgreSQL', icon: SiPostgresql, color: '#336791' },
  { name: 'Docker', icon: SiDocker, color: '#2496ed' },
  { name: 'Git', icon: SiGit, color: '#f1502f' },
  { name: 'Python', icon: SiPython, color: '#3776ab' },
];

export default function TechStack() {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">Tech Stack</h2>
        <p className="text-gray-300 text-lg">Technologies and tools I work with</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {techStack.map((tech, index) => {
          const Icon = tech.icon;
          return (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="glass glass-hover p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group"
            >
              <Icon size={40} color={tech.color} className="group-hover:scale-125 transition-transform" />
              <p className="text-sm font-medium text-gray-300 group-hover:text-white text-center">{tech.name}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
