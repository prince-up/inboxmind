import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactElement } from 'react';

import { FADE_VARIANTS } from '../SidebarAnimations';
import { useSidebarStore } from '../SidebarContext';
import { Button } from './Button';
import { Card } from './Card';
import { Footer } from './Footer';
import { Header } from './Header';
import { Loading } from './Loading';
import { Section } from './Section';

export interface SidebarProps {
  readonly version: string;
}

const sections = [
  {
    description: 'No summary is available for the current conversation.',
    title: 'Summary',
  },
  {
    description: 'No deadline has been detected.',
    title: 'Deadline',
  },
  {
    description: 'No reminder is scheduled.',
    title: 'Reminder',
  },
  {
    description: 'No actions are available.',
    title: 'Actions',
  },
  {
    description: 'No notes have been added.',
    title: 'Notes',
  },
] as const;

/**
 * Complete sidebar surface composed from reusable infrastructure components.
 */
export function Sidebar({ version }: SidebarProps): ReactElement {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const close = useSidebarStore((state) => state.close);
  const isLoading = useSidebarStore((state) => state.isLoading);
  const setTheme = useSidebarStore((state) => state.setTheme);
  const theme = useSidebarStore((state) => state.theme);

  return (
    <div className="im-sidebar">
      <Header onCollapse={close} version={version} />
      <main className="im-content" id="inboxmind-sidebar-content">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              animate="visible"
              className="im-content__state"
              exit="hidden"
              initial="hidden"
              key="loading"
              variants={FADE_VARIANTS}
            >
              <Loading />
            </motion.div>
          ) : isSettingsOpen ? (
            <motion.div
              animate="visible"
              exit="hidden"
              initial="hidden"
              key="settings"
              variants={FADE_VARIANTS}
            >
              <Card index={0}>
                <div className="im-section__heading">
                  <h2>Appearance</h2>
                </div>
                <div
                  aria-label="Sidebar theme"
                  className="im-theme-picker"
                  role="group"
                >
                  <Button
                    ariaLabel="Use dark theme"
                    onClick={() => {
                      setTheme('dark');
                    }}
                    variant={theme === 'dark' ? 'primary' : 'secondary'}
                  >
                    Dark
                  </Button>
                  <Button
                    ariaLabel="Use light theme"
                    onClick={() => {
                      setTheme('light');
                    }}
                    variant={theme === 'light' ? 'primary' : 'secondary'}
                  >
                    Light
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              animate="visible"
              className="im-sections"
              exit="hidden"
              initial="hidden"
              key="sections"
              variants={FADE_VARIANTS}
            >
              {sections.map((section, index) => (
                <Section
                  description={section.description}
                  index={index}
                  key={section.title}
                  title={section.title}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer
        isSettingsOpen={isSettingsOpen}
        onSettingsToggle={() => {
          setSettingsOpen((isOpen) => !isOpen);
        }}
      />
    </div>
  );
}
