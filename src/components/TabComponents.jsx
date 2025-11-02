import React from 'react';
import { motion } from 'framer-motion';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
      ${active 
        ? 'bg-gradient-to-r from-[#f59e0b] to-[#f97316] text-white shadow-lg'
        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow'
      }
    `}
  >
    {children}
  </button>
);

const TabPanel = ({ active, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
    className={`${active ? 'block' : 'hidden'}`}
  >
    {children}
  </motion.div>
);

const InfoCard = ({ icon, title, content }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="text-amber-500 mb-4">{icon}</div>
    <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
    <div className="text-slate-600 text-sm">{content}</div>
  </div>
);

export const TabNavigation = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map(([key, label]) => (
      <TabButton 
        key={key}
        active={activeTab === key}
        onClick={() => onTabChange(key)}
      >
        {label}
      </TabButton>
    ))}
  </div>
);

export const TabContent = ({ children, activeTab }) => (
  <div className="mt-6">
    {React.Children.map(children, child => (
      React.cloneElement(child, { active: child.props.tabKey === activeTab })
    ))}
  </div>
);

export { TabPanel, InfoCard };