import React, { useState, useRef, useEffect } from 'react';

interface Option { value: string; label: string; }

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | Option)[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({ value, onChange, options, placeholder, label, required, error, touched }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleClose = () => {
    if (!open) return;
    setClosing(true);
    timerRef.current = setTimeout(() => {
      setClosing(false);
      setOpen(false);
    }, 150);
  };

  const handleToggle = () => {
    if (open) {
      handleClose();
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('mousedown', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      clearTimeout(timerRef.current);
    };
  }, [open]);

  const resolved: Option[] = options.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = resolved.find(o => o.value === value);
  const hasValue = !!value;
  const showList = open || closing;

  const labelId = label ? `select-label-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined;
  const buttonId = label ? `select-button-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : undefined;

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', marginBottom: 0 }}>
      {label && (
        <label id={labelId} htmlFor={buttonId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 4 }}>
          {label}{required !== false ? ' *' : ''}
        </label>
      )}
      <button
        id={buttonId}
        aria-labelledby={labelId}
        aria-label={!label ? (placeholder || 'Select option') : undefined}
        aria-expanded={open}
        type="button"
        onClick={handleToggle}
        style={{
          width: '100%', height: 46, position: 'relative', marginTop: 6,
          border: `1px solid ${error && touched ? 'var(--danger)' : open ? 'var(--brand)' : 'var(--line)'}`,
          borderRadius: 12, padding: '0 32px 0 14px', fontSize: 14,
          fontFamily: 'inherit', color: hasValue ? 'var(--ink)' : 'var(--ink3)',
          background: 'var(--panel)', outline: 'none', cursor: 'pointer',
          textAlign: 'left', display: 'flex', alignItems: 'center',
          transition: 'border-color .15s, box-shadow .15s',
          boxShadow: error && touched ? '0 0 0 3px var(--dangerSoft)' : open ? '0 0 0 3px var(--brandSoft2)' : 'none',
        }}
        className="ng-auth-field"
      >
        {selected ? selected.label : (placeholder || 'Select...')}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            position: 'absolute', right: 12, top: '50%', marginTop: -7,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .2s', color: 'var(--ink3)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {showList && (
        <div
          ref={listRef}
          className="ng-dropdown-list"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            marginTop: 6, borderRadius: 12, background: 'var(--panel)',
            border: '1px solid var(--line)', boxShadow: 'var(--shadow)',
            overflow: 'hidden',
            animation: closing ? 'ngFadeDown .15s ease-out forwards' : 'ngFadeUp .15s ease-out',
            maxHeight: 220, overflowY: 'auto',
          }}
        >
          {resolved.map((o, i) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); handleClose(); }}
              style={{
                width: '100%', padding: '10px 16px', border: 'none',
                borderBottom: i < resolved.length - 1 ? '1px solid var(--line)' : 'none',
                background: value === o.value ? 'var(--hover)' : 'transparent',
                color: 'var(--ink)', fontFamily: 'inherit', fontSize: 14,
                textAlign: 'left', cursor: 'pointer',
                transition: 'background .1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = value === o.value ? 'var(--hover)' : 'transparent'; }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
