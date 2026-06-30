import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactElement } from 'react';

import type { ParsedConversation, ParsedEmail } from '~features/parser';

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

interface SidebarSectionViewModel {
  readonly description: string;
  readonly title: string;
}

/**
 * Complete sidebar surface composed from reusable infrastructure components.
 */
export function Sidebar({ version }: SidebarProps): ReactElement {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const close = useSidebarStore((state) => state.close);
  const currentConversation = useSidebarStore(
    (state) => state.currentConversation,
  );
  const currentEmail = useSidebarStore((state) => state.currentEmail);
  const emailSnapshot = useSidebarStore((state) => state.emailSnapshot);
  const isLoading = useSidebarStore((state) => state.isLoading);
  const setTheme = useSidebarStore((state) => state.setTheme);
  const theme = useSidebarStore((state) => state.theme);
  const visibleSections = createSidebarSections(
    currentConversation,
    currentEmail,
  );

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
              {emailSnapshot ? (
                <Card index={0}>
                  <div className="im-section__heading">
                    <h2>Email</h2>
                  </div>
                  <dl className="im-email-details">
                    <div className="im-email-details__row">
                      <dt>Subject</dt>
                      <dd>{emailSnapshot.subject}</dd>
                    </div>
                    <div className="im-email-details__row">
                      <dt>Sender</dt>
                      <dd>{emailSnapshot.sender ?? 'Unknown sender'}</dd>
                    </div>
                    <div className="im-email-details__row">
                      <dt>Recipients</dt>
                      <dd>
                        {emailSnapshot.recipients.length > 0
                          ? emailSnapshot.recipients.join(', ')
                          : 'No recipients detected'}
                      </dd>
                    </div>
                    <div className="im-email-details__row">
                      <dt>Date</dt>
                      <dd>{emailSnapshot.date ?? 'No date detected'}</dd>
                    </div>
                    <div className="im-email-details__row im-email-details__row--stacked">
                      <dt>Body preview</dt>
                      <dd>
                        {emailSnapshot.bodyPreview ||
                          'No body preview available'}
                      </dd>
                    </div>
                  </dl>
                </Card>
              ) : null}
              {visibleSections.map((section, index) => (
                <Section
                  description={section.description}
                  index={emailSnapshot ? index + 1 : index}
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

/**
 * Derives the existing sidebar sections from live parser state.
 */
function createSidebarSections(
  currentConversation: ParsedConversation | null,
  currentEmail: ParsedEmail | null,
): readonly SidebarSectionViewModel[] {
  if (!currentEmail) {
    return sections;
  }

  return [
    {
      description: createPreview(currentEmail.bodyPlain),
      title: 'Summary',
    },
    {
      description: currentEmail.date
        ? `Parsed email date: ${currentEmail.date}`
        : 'No date was detected in the parsed email.',
      title: 'Deadline',
    },
    {
      description: `Loaded conversation ${currentConversation?.conversationId ?? currentEmail.conversationId}.`,
      title: 'Reminder',
    },
    {
      description: createRecipientDescription(currentEmail),
      title: 'Actions',
    },
    {
      description:
        currentEmail.labels.length > 0
          ? `Labels: ${currentEmail.labels.join(', ')}`
          : 'No labels were detected in the parsed email.',
      title: 'Notes',
    },
  ];
}

/**
 * Creates a compact body preview from parsed email content.
 */
function createPreview(body: string): string {
  const normalized = body.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return 'No body preview is available for the parsed email.';
  }

  return normalized.length <= 180 ? normalized : `${normalized.slice(0, 179)}…`;
}

/**
 * Creates a compact live-recipient description from parser output.
 */
function createRecipientDescription(currentEmail: ParsedEmail): string {
  if (currentEmail.recipients.length === 0) {
    return 'No recipients were detected in the parsed email.';
  }

  return `Recipients: ${currentEmail.recipients
    .map((recipient) =>
      recipient.name
        ? `${recipient.name} <${recipient.email}>`
        : recipient.email,
    )
    .join(', ')}`;
}
