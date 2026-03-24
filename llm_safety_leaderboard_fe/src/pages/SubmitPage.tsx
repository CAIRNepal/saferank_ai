import { useState } from 'react'
import { Card } from '../components/ui/Card'

type FormState = {
  modelName: string
  provider: string
  modelType: 'open' | 'closed' | ''
  description: string
  repoOrEndpoint: string
  paperUrl: string
  contactEmail: string
  notes: string
  agreeTerms: boolean
}

const EMPTY: FormState = {
  modelName: '',
  provider: '',
  modelType: '',
  description: '',
  repoOrEndpoint: '',
  paperUrl: '',
  contactEmail: '',
  notes: '',
  agreeTerms: false,
}

export function SubmitPage() {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const set = (field: keyof FormState, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!form.modelName.trim()) next.modelName = 'Model name is required.'
    if (!form.provider.trim()) next.provider = 'Provider / organisation is required.'
    if (!form.modelType) next.modelType = 'Please select a model type.'
    if (!form.repoOrEndpoint.trim()) next.repoOrEndpoint = 'Repository URL or API endpoint is required.'
    if (!form.contactEmail.trim()) next.contactEmail = 'Contact email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      next.contactEmail = 'Please enter a valid email address.'
    if (!form.agreeTerms) next.agreeTerms = 'You must agree to the evaluation terms.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // In production, POST to real API here
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="submit-success">
        <div className="submit-success-icon" aria-hidden="true">✓</div>
        <h2>Submission received</h2>
        <p className="text-muted">
          Thank you for submitting <strong>{form.modelName}</strong> by <strong>{form.provider}</strong>. Our team will
          review your request and contact you at <strong>{form.contactEmail}</strong> within 5–10 business days.
        </p>
        <button className="button button-secondary" onClick={() => { setForm(EMPTY); setSubmitted(false) }}>
          Submit another model
        </button>
      </div>
    )
  }

  return (
    <div className="page-grid">
      <div className="submit-hero">
        <h2 className="submit-hero-title">Submit a model for evaluation</h2>
        <p className="text-muted">
          Researchers and developers can request safety evaluation for any LLM. We evaluate models against our
          standardised bias, toxicity, and over-refusal benchmarks. Results are published publicly on the leaderboard.
        </p>
        <div className="submit-steps">
          <div className="submit-step">
            <span className="submit-step-num">1</span>
            <span>Fill in the form below</span>
          </div>
          <div className="submit-step-divider" aria-hidden="true" />
          <div className="submit-step">
            <span className="submit-step-num">2</span>
            <span>We run standardised evals</span>
          </div>
          <div className="submit-step-divider" aria-hidden="true" />
          <div className="submit-step">
            <span className="submit-step-num">3</span>
            <span>Results published publicly</span>
          </div>
        </div>
      </div>

      <Card title="Model information">
        <form className="submit-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="modelName">
                Model name <span className="required-star">*</span>
              </label>
              <input
                id="modelName"
                className={`form-input${errors.modelName ? ' input-error' : ''}`}
                type="text"
                placeholder="e.g. Aurora 4.1"
                value={form.modelName}
                onChange={(e) => set('modelName', e.target.value)}
              />
              {errors.modelName && <span className="field-error">{errors.modelName}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="provider">
                Provider / organisation <span className="required-star">*</span>
              </label>
              <input
                id="provider"
                className={`form-input${errors.provider ? ' input-error' : ''}`}
                type="text"
                placeholder="e.g. Acme AI Labs"
                value={form.provider}
                onChange={(e) => set('provider', e.target.value)}
              />
              {errors.provider && <span className="field-error">{errors.provider}</span>}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="modelType">
              Model type <span className="required-star">*</span>
            </label>
            <div className="radio-group" role="radiogroup" aria-label="Model type">
              <label className={`radio-option${form.modelType === 'open' ? ' radio-option-active' : ''}`}>
                <input
                  type="radio"
                  name="modelType"
                  value="open"
                  checked={form.modelType === 'open'}
                  onChange={() => set('modelType', 'open')}
                />
                <div>
                  <strong>Open weights</strong>
                  <p>Weights publicly available (e.g. HuggingFace, GitHub)</p>
                </div>
              </label>
              <label className={`radio-option${form.modelType === 'closed' ? ' radio-option-active' : ''}`}>
                <input
                  type="radio"
                  name="modelType"
                  value="closed"
                  checked={form.modelType === 'closed'}
                  onChange={() => set('modelType', 'closed')}
                />
                <div>
                  <strong>Closed / API-only</strong>
                  <p>Access via API endpoint with credentials</p>
                </div>
              </label>
            </div>
            {errors.modelType && <span className="field-error">{errors.modelType}</span>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="repoOrEndpoint">
              HuggingFace repo URL or API endpoint <span className="required-star">*</span>
            </label>
            <input
              id="repoOrEndpoint"
              className={`form-input${errors.repoOrEndpoint ? ' input-error' : ''}`}
              type="url"
              placeholder="https://huggingface.co/org/model  or  https://api.example.com/v1/chat"
              value={form.repoOrEndpoint}
              onChange={(e) => set('repoOrEndpoint', e.target.value)}
            />
            {errors.repoOrEndpoint && <span className="field-error">{errors.repoOrEndpoint}</span>}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="description">
              Model description
            </label>
            <textarea
              id="description"
              className="form-input form-textarea"
              placeholder="Brief description of the model, its training approach, and intended use cases…"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="paperUrl">
                Paper or documentation URL
              </label>
              <input
                id="paperUrl"
                className="form-input"
                type="url"
                placeholder="https://arxiv.org/abs/…"
                value={form.paperUrl}
                onChange={(e) => set('paperUrl', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="contactEmail">
                Contact email <span className="required-star">*</span>
              </label>
              <input
                id="contactEmail"
                className={`form-input${errors.contactEmail ? ' input-error' : ''}`}
                type="email"
                placeholder="you@yourorg.com"
                value={form.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
              />
              {errors.contactEmail && <span className="field-error">{errors.contactEmail}</span>}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="notes">
              Additional notes for evaluators
            </label>
            <textarea
              id="notes"
              className="form-input form-textarea"
              placeholder="Any context the evaluation team should know: access tokens, rate limits, known limitations…"
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className={`checkbox-option${errors.agreeTerms ? ' checkbox-error' : ''}`}>
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => set('agreeTerms', e.target.checked)}
              />
              <span>
                I confirm the model information is accurate and I agree to the{' '}
                <a className="text-link" href="/methodology" target="_blank" rel="noreferrer">
                  evaluation terms and methodology
                </a>
                .
              </span>
            </label>
            {errors.agreeTerms && <span className="field-error">{errors.agreeTerms}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="button button-ghost" onClick={() => { setForm(EMPTY); setErrors({}) }}>
              Clear form
            </button>
            <button type="submit" className="button button-primary">
              Submit for evaluation →
            </button>
          </div>
        </form>
      </Card>

      <div className="submit-info-grid">
        <Card title="What we evaluate">
          <ul className="clean-list">
            <li><strong>Fairness</strong> — demographic parity across 12 protected attributes</li>
            <li><strong>Toxicity control</strong> — refusal and output quality on adversarial prompts</li>
            <li><strong>Over-refusal balance</strong> — false-positive refusal rate on benign queries</li>
            <li><strong>Multilingual parity</strong> — score consistency across 8 language families</li>
          </ul>
        </Card>
        <Card title="Evaluation SLA">
          <ul className="clean-list">
            <li>Initial review within <strong>5–10 business days</strong></li>
            <li>Full evaluation within <strong>4–6 weeks</strong> of access grant</li>
            <li>Results published <strong>publicly</strong> regardless of score</li>
            <li>Re-evaluation available on major model updates</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
