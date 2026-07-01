import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type ReactElement } from 'react';

import { ActionsView } from '../../../components/actions/ActionsView';
import { TimelineView } from '../../../components/timeline/TimelineView';
import { AgentView } from '../../../components/agent/AgentView';
import { reminderStore } from '../../reminders/ReminderStore';
import type { Reminder } from '../../reminders/ReminderTypes';
import { FADE_VARIANTS } from '../SidebarAnimations';
import { useSidebarStore } from '../SidebarContext';
import { Button } from './Button';
import { Card } from './Card';
import { Footer } from './Footer';
import { Header } from './Header';
import { Loading } from './Loading';
import { calendarService } from '../../../services/CalendarService';

export interface SidebarProps {
  readonly version: string;
}

export function Sidebar({ version }: SidebarProps): ReactElement {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const close = useSidebarStore((state) => state.close);
  const emailSnapshot = useSidebarStore((state) => state.emailSnapshot);
  const isLoading = useSidebarStore((state) => state.isLoading);
  const setLoading = useSidebarStore((state) => state.setLoading);
  const setTheme = useSidebarStore((state) => state.setTheme);
  const theme = useSidebarStore((state) => state.theme);
  const [activeTab, setActiveTab] = useState<'Email' | 'Agent' | 'Actions' | 'Timeline'>(
    'Email',
  );
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    // Failsafe to unstick loading spinner
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    if (!emailSnapshot?.conversationId) {
      setCurrentReminder(null);
      return;
    }

    let isMounted = true;
    const fetchReminder = async () => {
      try {
        const reminders = await reminderStore.getReminders();
        const reminder = reminders.find(
          (r) => r.threadId === emailSnapshot.conversationId,
        );
        if (isMounted) {
          console.log(`[PIPELINE] Sidebar fetchReminder: Found? ${!!reminder}`, reminder ? Object.keys(reminder) : 'null');
          if (reminder) {
            setCurrentReminder(reminder);
          } else {
            setCurrentReminder(null);
          }
        }
      } catch (err) {
        console.error(`[PIPELINE] Sidebar Error:`, err);
      }
    };

    void fetchReminder();
    const interval = setInterval(() => {
      void fetchReminder();
    }, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [emailSnapshot?.conversationId]);

  return (
    <div
      className="im-sidebar"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Header onCollapse={close} version={version} />

      {!isLoading && !isSettingsOpen && (
        <div
          className="im-tabs"
          style={{
            display: 'flex',
            gap: '4px',
            padding: '8px 12px',
            borderBottom: '1px solid var(--im-border)',
          }}
        >
          <Button
            ariaLabel="Email tab"
            variant={activeTab === 'Email' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('Email')}
          >
            Email
          </Button>
          <Button
            ariaLabel="Agent tab"
            variant={activeTab === 'Agent' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('Agent')}
          >
            Agent
          </Button>
          <Button
            ariaLabel="Actions tab"
            variant={activeTab === 'Actions' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('Actions')}
          >
            Actions
          </Button>
          <Button
            ariaLabel="Timeline tab"
            variant={activeTab === 'Timeline' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('Timeline')}
          >
            Timeline
          </Button>
        </div>
      )}

      <main
        className="im-content"
        id="inboxmind-sidebar-content"
        style={{ flex: 1, overflowY: 'auto', padding: '12px' }}
      >
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
                    onClick={() => setTheme('dark')}
                    variant={theme === 'dark' ? 'primary' : 'secondary'}
                  >
                    Dark
                  </Button>
                  <Button
                    ariaLabel="Use light theme"
                    onClick={() => setTheme('light')}
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
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {activeTab === 'Email' && (
                <>
                  {emailSnapshot ? (
                    <Card index={0}>
                      {currentReminder ? (
                        <div
                          className="im-intelligence"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            padding: '8px 0',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid var(--im-border)' }}>
                            <span style={{ fontSize: '20px' }}>🧠</span>
                            <h2 style={{ fontSize: '15px', margin: 0, fontWeight: 'bold' }}>InboxMind Intelligence</h2>
                          </div>

                          {/* Quick Badges */}
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--im-bg-elevated)', border: '1px solid var(--im-border)', display: 'flex', flexDirection: 'column', flex: '1 1 min-content' }}>
                              <span style={{ fontSize: '10px', color: 'var(--im-text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '2px' }}>Category</span>
                              <span style={{ fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                {currentReminder.category}
                                {currentReminder.subcategory ? ` • ${currentReminder.subcategory}` : ''}
                              </span>
                            </div>
                            <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--im-bg-elevated)', border: '1px solid var(--im-border)', display: 'flex', flexDirection: 'column', flex: '1 1 min-content' }}>
                              <span style={{ fontSize: '10px', color: 'var(--im-text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '2px' }}>Priority</span>
                              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {currentReminder.priority === 'Critical' ? '🔴' : currentReminder.priority === 'High' ? '🟠' : currentReminder.priority === 'Medium' ? '🟡' : '🟢'}
                                {currentReminder.priority}
                              </span>
                            </div>
                            <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--im-bg-elevated)', border: '1px solid var(--im-border)', display: 'flex', flexDirection: 'column', flex: '1 1 min-content' }}>
                              <span style={{ fontSize: '10px', color: 'var(--im-text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '2px' }}>Confidence</span>
                              <span style={{ fontSize: '13px', fontWeight: 'bold', color: currentReminder.confidence > 0.8 ? 'var(--im-success)' : 'inherit' }}>
                                {Math.round(currentReminder.confidence * 100)}%
                              </span>
                            </div>
                          </div>

                          {/* Summary */}
                          <div>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--im-text-muted)', fontWeight: 'bold', marginBottom: '6px' }}>
                              Summary
                            </div>
                            <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--im-text)' }}>
                              {currentReminder.summary}
                            </div>
                          </div>

                          {/* Reasoning & Signals Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: 'var(--im-bg-hover)', padding: '16px', borderRadius: '12px' }}>
                            <div>
                              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--im-text-muted)', fontWeight: 'bold', marginBottom: '6px' }}>
                                Reasoning
                              </div>
                              <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                {currentReminder.reasoning}
                              </div>
                            </div>

                            <div>
                              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--im-text-muted)', fontWeight: 'bold', marginBottom: '6px' }}>
                                Detected Signals
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {currentReminder.detectedSignals?.map((sig, i) => (
                                  <span key={i} style={{ fontSize: '11px', padding: '4px 8px', background: 'var(--im-bg)', borderRadius: '6px', border: '1px solid var(--im-border)', color: 'var(--im-text-muted)' }}>
                                    ✓ {sig}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Action Items Meta */}
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {currentReminder.deadline && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', background: 'rgba(255,100,100,0.1)', color: '#ff6666', borderRadius: '20px', fontWeight: 'bold' }}>
                                ⏰ Deadline: {currentReminder.deadline}
                              </div>
                            )}
                            {currentReminder.requiresReply && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px', background: 'rgba(100,200,100,0.1)', color: 'var(--im-success)', borderRadius: '20px', fontWeight: 'bold' }}>
                                ↩️ Reply Expected
                              </div>
                            )}
                          </div>

                          {/* Phase 5: Smart Calendar Integration */}
                          {currentReminder.context?.calendarEvent && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--im-bg-hover)', padding: '16px', borderRadius: '12px', border: '1px solid var(--im-border)' }}>
                              <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--im-text-muted)', fontWeight: 'bold', marginBottom: '4px' }}>
                                Calendar Event Detected
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                  <span>📅</span>
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{currentReminder.context.calendarEvent.title}</div>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <span>⏰</span>
                                  <div style={{ fontSize: '13px' }}>
                                    {currentReminder.context.calendarEvent.date} {currentReminder.context.calendarEvent.startTime !== 'TBD' && `at ${currentReminder.context.calendarEvent.startTime}`}
                                    {currentReminder.context.calendarEvent.timeZone && ` ${currentReminder.context.calendarEvent.timeZone}`}
                                  </div>
                                </div>
                                {currentReminder.context.calendarEvent.location && (
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <span>📍</span>
                                    <div style={{ fontSize: '13px', wordBreak: 'break-all' }}>
                                      {currentReminder.context.calendarEvent.location.startsWith('http') ? (
                                        <a href={currentReminder.context.calendarEvent.location} target="_blank" rel="noreferrer" style={{ color: 'var(--im-primary)' }}>
                                          {currentReminder.context.calendarEvent.location}
                                        </a>
                                      ) : (
                                        currentReminder.context.calendarEvent.location
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                                <Button 
                                  ariaLabel="Add to Google Calendar"
                                  variant="primary" 
                                  onClick={() => {
                                    if (currentReminder.context?.calendarEvent) {
                                      window.open(calendarService.generateGoogleCalendarUrl(currentReminder.context.calendarEvent), '_blank');
                                    }
                                  }}
                                >
                                  Add to Google Calendar
                                </Button>
                                <Button 
                                  ariaLabel="Copy Event Details"
                                  variant="secondary"
                                  onClick={() => {
                                    const ev = currentReminder.context?.calendarEvent;
                                    if (ev) {
                                      void navigator.clipboard.writeText(`Event: ${ev.title}\nDate: ${ev.date} ${ev.startTime}\nLocation: ${ev.location}`);
                                    }
                                  }}
                                >
                                  Copy Event Details
                                </Button>
                                <Button 
                                  ariaLabel="Create Reminder"
                                  variant="ghost"
                                  onClick={() => setActiveTab('Actions')}
                                >
                                  Create Reminder
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: '16px',
                            textAlign: 'center',
                            color: 'var(--im-text-muted)',
                            fontSize: '13px',
                          }}
                        >
                          <Loading />
                          <p style={{ marginTop: '12px', fontSize: '12px' }}>
                            Analyzing email intent...
                          </p>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card index={0}>
                      <p
                        style={{
                          padding: '16px',
                          color: 'var(--im-text-muted)',
                          textAlign: 'center',
                          fontSize: '12px',
                        }}
                      >
                        No email selected.
                      </p>
                    </Card>
                  )}
                </>
              )}

              {activeTab === 'Agent' && <AgentView />}

              {activeTab === 'Actions' && <ActionsView />}

              {activeTab === 'Timeline' && <TimelineView />}
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
