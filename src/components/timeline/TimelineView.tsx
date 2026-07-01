import { useEffect, useState, type ReactElement } from 'react';

import type { TimelineEvent } from '../../features/decision/DecisionTypes';
import { reminderStore } from '../../features/reminders/ReminderStore';
import type { Reminder } from '../../features/reminders/ReminderTypes';
import { useSidebarStore } from '../../features/sidebar/SidebarContext';

export function TimelineView(): ReactElement {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const emailSnapshot = useSidebarStore((state) => state.emailSnapshot);

  useEffect(() => {
    let isMounted = true;
    const loadReminders = async () => {
      try {
        const data = await reminderStore.getReminders();
        if (isMounted) setReminders(data);
      } catch (e) {
        console.error(e);
      }
    };
    void loadReminders();

    const interval = setInterval(() => {
      void loadReminders();
    }, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentReminder = reminders.find(
    (r) => r.threadId === emailSnapshot?.conversationId,
  );
  
  const events: TimelineEvent[] = currentReminder?.timeline ?? [];
  // Sort by timestamp ascending to show linear progression top-to-bottom
  events.sort((a, b) => a.timestamp - b.timestamp);

  if (events.length === 0) {
    return (
      <div className="im-timeline" style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center', color: 'var(--im-text-muted)', marginTop: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--im-text)' }}>No timeline events</div>
          <div style={{ fontSize: '12px', maxWidth: '200px', margin: '0 auto' }}>
            The parser has not yet generated an intelligence snapshot for this thread.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="im-timeline" style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '24px' }}>
        Activity Timeline
      </div>

      <div style={{ position: 'relative', paddingLeft: '8px' }}>
        {events.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              bottom: '24px',
              left: '11px',
              width: '2px',
              background: 'var(--im-border)',
              zIndex: 0
            }}
          />
        )}

        {events.map((evt, index) => (
          <div
            key={evt.id}
            style={{
              position: 'relative',
              marginBottom: index === events.length - 1 ? '0' : '32px',
              paddingLeft: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '0',
                top: '6px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: evt.status === 'Completed' ? 'var(--im-success)' : 'var(--im-text-muted)',
                boxShadow: '0 0 0 4px var(--im-bg)',
                zIndex: 1,
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--im-text)' }}>
                {evt.description}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--im-text-muted)', minWidth: '60px', textAlign: 'right' }}>
                {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div style={{ fontSize: '11px', color: 'var(--im-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                padding: '2px 6px',
                borderRadius: '8px',
                background: evt.status === 'Completed' ? 'var(--im-success-bg, rgba(0,200,0,0.1))' : 'var(--im-bg-hover)',
                color: evt.status === 'Completed' ? 'var(--im-success)' : 'inherit',
                fontWeight: 'bold',
                fontSize: '10px'
              }}>
                {evt.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
