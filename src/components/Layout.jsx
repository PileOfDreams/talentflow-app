// Basic layout of our webpages
// One of its main functions is building the navigation sidebar

import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Briefcase, Users, ClipboardList } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import ThemeSwitcher from './ThemeSwitcher';
import TalentFlowLogo from './TalentFlowLogo';

export default function Layout() {
  const navLinkClasses = ({ isActive }) => 
    `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-accent/80 text-accent-foreground' : 'text-foreground/70 hover:bg-muted hover:text-foreground'
    }`;

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/candidates', label: 'Candidates', icon: Users },
    { to: '/assessments', label: 'Assessments', icon: ClipboardList },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          },
        }}
      />
      
      <aside className="w-64 bg-secondary p-4 border-r border-muted/50 flex flex-col">
        <div className="flex justify-start mb-4">
          <ThemeSwitcher />
        </div>

        <div className="mb-8 flex items-center gap-3">
          <TalentFlowLogo />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
            TalentFlow
          </h1>
        </div>
        
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={navLinkClasses}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}