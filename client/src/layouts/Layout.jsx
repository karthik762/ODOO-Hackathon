import Sidebar from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/**
 * Layout Container
 * Integrates Sidebar navigation with TopNavbar and main page content with animations.
 */
const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar - fixed left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header navbar */}
        <TopNavbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
