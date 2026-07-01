import { useEffect, useState, type ReactElement } from 'react';

import type { ActionDef } from '../../features/decision/DecisionTypes';
import { reminderStore } from '../../features/reminders/ReminderStore';
import type { Reminder } from '../../features/reminders/ReminderTypes';
import { useSidebarStore } from '../../features/sidebar/SidebarContext';

export function ActionsView(): ReactElement {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const emailSnapshot = useSidebarStore((state) => state.emailSnapshot);

  useEffect(() => {
    const loadReminders = async () => {
      const data = await reminderStore.getReminders();
      setReminders(data);
    };
    void loadReminders();

    const interval = setInterval(() => {
      void loadReminders();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentReminder = reminders.find(
    (r) => r.threadId === emailSnapshot?.conversationId,
  );

  if (!currentReminder?.recommendedActions || currentReminder.recommendedActions.length === 0) {
    return (
      <div className="im-actions" style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center', color: 'var(--im-text-muted)', marginTop: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>📭</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--im-text)' }}>No pending actions</div>
          <div style={{ fontSize: '12px', maxWidth: '200px', margin: '0 auto' }}>
            {currentReminder?.category === 'Unknown' 
              ? 'Insufficient signals detected in this thread to recommend contextual actions.'
              : 'No specific actions are required for this email category.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="im-actions" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px' }}>
          Recommended Actions
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentReminder.recommendedActions.map((act: ActionDef) => (
            <button
              key={act.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'var(--im-bg-elevated)',
                border: '1px solid var(--im-border)',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.2s, transform 0.1s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--im-bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--im-bg-elevated)';
              }}
              onClick={() => {
                if (act.handler) {
                  void act.handler();
                }
              }}
            >
              <span style={{ fontSize: '20px' }}>
                {act.icon === 'calendar' ? '📅' : act.icon === 'book' ? '📖' : act.icon === 'play' ? '▶️' : act.icon === 'bell' ? '⏰' : act.icon === 'user-plus' ? '📝' : act.icon === 'code' ? '💻' : act.icon === 'credit-card' ? '💳' : act.icon === 'download' ? '📥' : act.icon === 'mail-reply' ? '↩️' : act.icon === 'mail-forward' ? '↪️' : '✨'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--im-text)' }}>{act.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--im-text-muted)', marginTop: '2px' }}>{act.description}</div>
              </div>
              <div style={{
                fontSize: '10px',
                padding: '4px 8px',
                background: act.priority === 'Critical' ? 'var(--im-priority-high-bg)' : 'var(--im-bg)',
                color: act.priority === 'Critical' ? 'var(--im-priority-high-text)' : 'var(--im-text-muted)',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                {act.priority}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
