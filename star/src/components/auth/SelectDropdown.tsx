import React, { useState, useRef, useEffect, useId } from 'react';

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
  /** Called when the list closes without a choice (the field was "visited"). */
  onBlur?: () => void;
}

/**
 * Custom select (a native <select> can't be styled to match the auth fields).
 * Follows the listbox pattern: Enter/Space/ArrowDown open it, arrows move,
 * Enter picks, Escape closes and returns focus to the button.
 */
const SelectDropdown: React.FC<SelectDropdownProps> = ({ value, onChange, options, placeholder, label, required, error, touched, onBlur }) => {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  // Ids used to come from the label text with non-Latin letters stripped, so
  // every Arabic-labelled dropdown got the same id and the labels collided.
  const uid = useId();
  const labelId = `${uid}-label`;
  const buttonId = `${uid}-button`;
  const listId = `${uid}-list`;
  const errorId = `${uid}-error`;

  const handleClose = (returnFocus = false) => {
    if (!open) return;
    setClosing(true);
    timerRef.current = setTimeout(() => {
      setClosing(false);
      setOpen(false);
      onBlur?.();
    }, 150);
    if (returnFocus) buttonRef.current?.focus();
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
  const showError = !!error && !!touched;

  // Focus the chosen option (or the first) when the list opens.
  useEffect(() => {
    if (!open || closing) return;
    const items = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (!items?.length) return;
    const idx = Math.max(0, resolved.findIndex((o) => o.value === value));
    items[idx]?.focus();
  }, [open]);

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? []);
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') { e.preventDefault(); handleClose(true); return; }
    if (e.key === 'Tab') { handleClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, at + 1)]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, at - 1)]?.focus(); }
    if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
    if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
  };

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', marginBottom: 0 }}>
      {label && (
        <label id={labelId} htmlFor={buttonId} style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 4 }}>
          {label}{required !== false ? <span aria-hidden="true"> *</span> : ''}
        </label>
      )}
      <button
        ref={buttonRef}
        id={buttonId}
        aria-labelledby={label ? `${labelId} ${buttonId}` : undefined}
        aria-label={!label ? (placeholder || 'Select option') : undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-required={required !== false || undefined}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? errorId : undefined}
        type="button"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); setOpen(true); }
          if (open && e.key === 'Escape') { e.preventDefault(); handleClose(true); }
        }}
        style={{
          width: '100%', height: 46, position: 'relative', marginTop: 6,
          border: `1px solid ${showError ? 'var(--danger)' : open ? 'var(--brand)' : 'var(--line)'}`,
          borderRadius: 12, paddingBlock: 0, paddingInlineStart: 14, paddingInlineEnd: 32, fontSize: 14,
          fontFamily: 'inherit', color: hasValue ? 'var(--ink)' : 'var(--ink3)',
          background: 'var(--panel)', outline: 'none', cursor: 'pointer',
          textAlign: 'start', display: 'flex', alignItems: 'center',
          transition: 'border-color .15s, box-shadow .15s',
          boxShadow: showError ? '0 0 0 3px var(--dangerSoft)' : open ? '0 0 0 3px var(--brandSoft2)' : 'none',
        }}
        className="ng-auth-field"
      >
        {selected ? selected.label : (placeholder || 'Select...')}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          style={{
            position: 'absolute', insetInlineEnd: 12, top: '50%', marginTop: -7,
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
          id={listId}
          role="listbox"
          aria-labelledby={label ? labelId : undefined}
          onKeyDown={onListKeyDown}
          className="ng-dropdown-list"
          style={{
            position: 'absolute', top: '100%', insetInline: 0, zIndex: 50,
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
              role="option"
              aria-selected={value === o.value}
              onClick={() => { onChange(o.value); handleClose(true); }}
              style={{
                width: '100%', padding: '10px 16px', border: 'none',
                borderBottom: i < resolved.length - 1 ? '1px solid var(--line)' : 'none',
                background: value === o.value ? 'var(--hover)' : 'transparent',
                color: 'var(--ink)', fontFamily: 'inherit', fontSize: 14,
                textAlign: 'start', cursor: 'pointer',
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
      {showError && (
        <div id={errorId} role="alert" style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
};

export default SelectDropdown;
