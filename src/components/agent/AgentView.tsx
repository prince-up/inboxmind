import { useEffect, useState, type ReactElement } from 'react';

import { agentStore } from '../../features/agent/AgentStore';
import type { AgentSnapshot } from '../../features/agent/AgentTypes';
import { useSidebarStore } from '../../features/sidebar/SidebarContext';

export function AgentView(): ReactElement {
  const [snapshots, setSnapshots] = useState<AgentSnapshot[]>([]);
  const emailSnapshot = useSidebarStore((state) => state.emailSnapshot);

  useEffect(() => {
    let isMounted = true;
    const loadSnapshots = async () => {
      try {
        const data = await agentStore.getSnapshots();
        if (isMounted) setSnapshots(data);
      } catch (e) {
        console.error(e);
      }
    };
    void loadSnapshots();

    const interval = setInterval(() => {
      void loadSnapshots();
    }, 1500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentSnapshot = snapshots.find(
    (s) => s.conversationId === emailSnapshot?.conversationId,
  );

  if (!currentSnapshot) {
    return (
      <div className="im-agent" style={{ padding: '16px' }}>
        <div style={{ textAlign: 'center', color: 'var(--im-text-muted)', marginTop: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🤖</div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--im-text)' }}>AI Agent Sleeping</div>
          <div style={{ fontSize: '12px', maxWidth: '200px', margin: '0 auto' }}>
            The agent has not processed this thread yet.
          </div>
        </div>
      </div>
    );
  }

  const { dailyDigest, pendingTasks, suggestedReplies, insights, memory } = currentSnapshot;

  return (
    <div className="im-agent" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Today's Focus */}
      <div style={{ background: 'var(--im-bg-elevated)', border: '1px solid var(--im-border)', borderRadius: '12px', padding: '16px' }}>
        <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎯</span> Today&apos;s Focus
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ fontSize: '12px' }}>Interviews: {dailyDigest.interviewsCount}</div>
          <div style={{ fontSize: '12px' }}>Assessments: {dailyDigest.assessmentsCount}</div>
          <div style={{ fontSize: '12px' }}>Expiring Offers: {dailyDigest.expiringOffersCount}</div>
          <div style={{ fontSize: '12px' }}>Pending Replies: {dailyDigest.pendingRepliesCount}</div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div>
          <h3 style={{ fontSize: '13px', margin: '0 0 12px 0' }}>💡 Agent Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {insights.map((insight) => (
              <div key={insight.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--im-bg)', borderRadius: '8px', borderLeft: '3px solid var(--im-primary)' }}>
                <span>{insight.icon}</span>
                <span style={{ fontSize: '13px' }}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      <div>
        <h3 style={{ fontSize: '13px', margin: '0 0 12px 0' }}>📋 Pending Tasks</h3>
        {pendingTasks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendingTasks.map((task) => (
              <label key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--im-primary)' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{task.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--im-text-muted)' }}>{task.description}</div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--im-text-muted)' }}>No pending tasks generated for this thread.</div>
        )}
      </div>

      {/* Suggested Replies */}
      {suggestedReplies.length > 0 && (
        <div>
          <h3 style={{ fontSize: '13px', margin: '0 0 12px 0' }}>✍️ Smart Replies</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {suggestedReplies.map((reply) => (
              <button key={reply.id} style={{ padding: '6px 12px', background: 'var(--im-bg-hover)', border: '1px solid var(--im-border)', borderRadius: '16px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{reply.icon}</span> {reply.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Memory Debug */}
      <div>
        <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', color: 'var(--im-text-muted)' }}>🧠 Agent Memory (Thread)</h3>
        <pre style={{ fontSize: '10px', background: '#111', color: '#0f0', padding: '12px', borderRadius: '8px', overflowX: 'auto' }}>
          {JSON.stringify({
            conversationId: memory.conversationId,
            tasks: memory.pendingTasks.length,
            completed: memory.completedTasks.length,
            previousDecisions: memory.previousDecisions,
          }, null, 2)}
        </pre>
      </div>

    </div>
  );
}
