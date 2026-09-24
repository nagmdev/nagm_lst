import React from 'react';
import { User, Briefcase, Building2 } from 'lucide-react';
import type { AccountRole } from '../../auth';
import { useAuthText } from '../../i18n/authText';

interface Props {
  selected: AccountRole;
  onSelect: (role: AccountRole) => void;
}

// Three ways in. "Company" registers the organisation itself — that person
// becomes its Company Manager; "Recruiter" is a person who joins an existing
// company, creates one, or works independently. Either way the company record
// is de-duplicated by slug/domain, so there is never a second "Sama Group".
const ROLES: { key: AccountRole; Icon: typeof User }[] = [
  { key: 'candidate', Icon: User },
  { key: 'recruiter', Icon: Briefcase },
  { key: 'company', Icon: Building2 },
];

/**
 * Account-type picker shown on sign-up. Implemented as a radio group so it is
 * keyboard- and screen-reader-navigable (arrow keys move between options).
 *
 * NOTE: choosing "Recruiter"/"Company" only *requests* that access — the account
 * is created as a normal user until an admin approves it.
 */
const RoleCards: React.FC<Props> = ({ selected, onSelect }) => {
  const t = useAuthText();
  const text: Record<AccountRole, { label: string; hint: string }> = {
    candidate: { label: t.roleCandidate, hint: t.roleCandidateHint },
    recruiter: { label: t.roleRecruiter, hint: t.roleRecruiterHint },
    company: { label: t.roleCompany, hint: t.roleCompanyHint },
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    // In RTL the cards run right-to-left, so ArrowLeft moves to the NEXT card.
    const forward = e.key === 'ArrowDown' || (t.isAr ? e.key === 'ArrowLeft' : e.key === 'ArrowRight');
    const next = ROLES[(index + (forward ? 1 : -1) + ROLES.length) % ROLES.length].key;
    onSelect(next);
    // Roving tabindex: keyboard focus follows the checked radio.
    const group = (e.currentTarget as HTMLElement).parentElement;
    requestAnimationFrame(() => group?.querySelector<HTMLButtonElement>(`[data-role="${next}"]`)?.focus());
  };

  return (
    <div
      role="radiogroup"
      aria-label={t.accountType}
      className="ng-role-cards"
      style={{ display: 'flex', gap: 10, marginBottom: 4 }}
    >
      {ROLES.map(({ key, Icon }, i) => {
        const active = selected === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            data-role={key}
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
            <Icon size={20} aria-hidden="true" style={{ color: active ? 'var(--brand)' : 'var(--ink3)' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.2 }}>{text[key].label}</span>
            <span style={{ fontSize: 11, color: 'var(--ink3)', lineHeight: 1.2 }}>{text[key].hint}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RoleCards;
