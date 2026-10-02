import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import {
  PRIORITIES,
  STATUSES,
  ticketFormSchema,
  toFieldErrors,
} from '../lib/ticketSchema.js';
import { PRIORITY_LABEL, STATUS_LABEL } from '../lib/format.js';
import { CloseIcon, Keycap } from './Icons.jsx';

const EMPTY_FORM = {
  title: '',
  description: '',
  customerEmail: '',
  priority: 'MEDIUM',
  status: 'OPEN',
};

/**
 * Native <dialog> keeps focus trapping and Escape handling without pulling in a
 * modal library. Validation runs client side first, then again on the server.
 */
export default function NewTicketDialog({ open, onClose, onCreated }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Validates and submits the form, creating the ticket through the API.
  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const parsed = ticketFormSchema.safeParse(form);

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setSaving(true);

    try {
      const { ticket } = await api.createTicket(parsed.data);
      setForm(EMPTY_FORM);
      onCreated(ticket);
      onClose();
    } catch (error) {
      setFieldErrors(error.fields ?? {});
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  // Updates one field and clears its error as soon as the user edits it.
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));
  }

  // Builds the shared props for a controlled field, including error wiring.
  function fieldProps(name) {
    return {
      id: `ticket-${name}`,
      name,
      value: form[name],
      onChange: handleChange,
      'aria-invalid': Boolean(fieldErrors[name]) || undefined,
      'aria-describedby': fieldErrors[name] ? `ticket-${name}-error` : undefined,
      className: `field-control ${fieldErrors[name] ? 'field-control-invalid' : ''}`,
    };
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop closes the dialog; clicks inside do not.
        if (event.target === dialogRef.current) onClose();
      }}
      className="w-[calc(100vw-2rem)] max-w-lg rounded-lg border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/25"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">New ticket</h2>
            <p className="mt-0.5 text-xs text-ink-3">
              Title, description and customer email are required.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon border-0"
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 border-b border-line bg-surface-2 px-5 py-2 text-xs text-ink-3">
          <span>
            Press <Keycap>Esc</Keycap> to close
          </span>
        </div>

        <div className="space-y-4 px-5 py-5">
          <Field
            label="Title"
            hint="Up to 120 characters"
            error={fieldErrors.title}
            input={<input {...fieldProps('title')} autoFocus placeholder="Short summary of the request" />}
          />

          <Field
            label="Description"
            hint="What happened, and what did the customer expect?"
            error={fieldErrors.description}
            input={
              <textarea
                {...fieldProps('description')}
                rows={4}
                placeholder="Include order references, error messages or timestamps."
              />
            }
          />

          <Field
            label="Customer email"
            error={fieldErrors.customerEmail}
            input={
              <input
                {...fieldProps('customerEmail')}
                type="email"
                autoComplete="off"
                placeholder="name@company.com"
              />
            }
          />

          <Field
            label="Priority"
            error={fieldErrors.priority}
            input={
              <select {...fieldProps('priority')}>
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABEL[value]}
                  </option>
                ))}
              </select>
            }
          />

          <Field
            label="Status"
            error={fieldErrors.status}
            input={
              <select {...fieldProps('status')}>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
            }
          />

          {formError ? (
            <p role="alert" className="rounded-md bg-high-soft px-3 py-2 text-sm text-high">
              {formError}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-line bg-surface-2 px-5 py-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create ticket'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

// Labels one form field and renders its validation message.
function Field({ label, hint, error, input }) {
  return (
    <div>
      <label htmlFor={input.props.id} className="field-label">
        {label}
      </label>
      {hint ? <p className="-mt-1 mb-1.5 text-xs text-ink-3">{hint}</p> : null}
      {input}
      {error ? (
        <p id={`${input.props.id}-error`} role="alert" className="mt-1.5 text-xs text-high">
          {error}
        </p>
      ) : null}
    </div>
  );
}