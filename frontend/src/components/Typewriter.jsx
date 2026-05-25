import { motion } from 'framer-motion';

export const Typewriter = ({ text }) => {
  return (
    <motion.div>
      {text.split("").map((char, i) => (
        <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};