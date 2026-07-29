import React from 'react';
import { User, Briefcase, Building2 } from 'lucide-react';
import type { AccountRole } from '../../auth';

interface Props {
  selected: AccountRole;
  onSelect: (role: AccountRole) => void;
}

// People sign up, not organizations. A recruiter then joins an existing company
// or creates one — which is what prevents duplicate company records.
const ROLES: { key: AccountRole; label: string; hint: string; Icon: typeof User }[] = [
  { key: 'candidate', label: 'Candidate', hint: 'Find a job', Icon: User },
  { key: 'recruiter', label: 'Recruiter', hint: 'Hire talent', Icon: Briefcase },
];

/**
 * Account-type picker shown on sign-up. Implemented as a radio group so it is
 * keyboard- and screen-reader-navigable (arrow keys move between options).
 *
 * NOTE: choosing "Recruiter"/"Company" only *requests* that access — the account
 * is created as a normal user until an admin approves it.
 */
const RoleCards: React.FC<Props> = ({ selected, onSelect }) => {
  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    onSelect(ROLES[(index + dir + ROLES.length) % ROLES.length].key);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="ng-role-cards"
      style={{ display: 'flex', gap: 10, marginBottom: 4 }}
    >
      {ROLES.map(({ key, label, hint, Icon }, i) => {
        const active = selected === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(key)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="ng-role-tab"
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '14px 8px',
              borderRadius: 14,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'center',
              border: `1.5px solid ${active ? 'var(--brand)' : 'var(--line)'}`,
              background: active ? 'var(--brandSoft)' : 'var(--panel)',
              color: active ? 'var(--brandInk)' : 'var(--ink2)',
              boxShadow: active ? '0 0 0 3px var(--brandSoft2)' : 'none',
              transition: 'border-color .15s, background .15s, color .15s, box-shadow .15s',
            }}
          >
            <Icon size={20} style={{ color: active ? 'var(--brand)' : 'var(--ink3)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.1 }}>{label}</span>
            <span style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.1 }}>{hint}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleCards;
