import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden">
      <div className="orb orb-purple w-[500px] h-[500px] top-0 left-0 -translate-x-1/2 -translate-y-1/2 opacity-20" />
      <div className="orb orb-blue w-[500px] h-[500px] bottom-0 right-0 translate-x-1/2 translate-y-1/2 opacity-15" />
      <div className="dot-grid absolute inset-0 opacity-40" />
      <div className="container-xl relative z-10 text-center py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="text-[180px] font-heading font-800 leading-none gradient-text mb-4 select-none">404</div>
          <h1 className="text-4xl font-heading font-700 text-[#1B3172] mb-4">Page Not Found</h1>
          <p className="text-[#475569] text-lg max-w-md mx-auto mb-10">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <Link to="/contact" className="btn-ghost">
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
