-- Campos de la calculadora de ahorro (origen del lead, estimaciones y CP).
-- Ejecutar en bases que ya tengan landing_leads con 001 y 002 aplicados.
-- El detalle completo del cuestionario se guarda además en extra_data.calculator (JSONB).

ALTER TABLE landing_leads
  ADD COLUMN IF NOT EXISTS lead_origin VARCHAR(30) NOT NULL DEFAULT 'contact',
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS monthly_bill NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS estimated_savings_percent SMALLINT,
  ADD COLUMN IF NOT EXISTS estimated_monthly_saving NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS calculator_completed BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_landing_leads_origin ON landing_leads(lead_origin);
CREATE INDEX IF NOT EXISTS idx_landing_leads_phone ON landing_leads(phone);

COMMENT ON COLUMN landing_leads.lead_origin IS 'contact | calculator | both';
COMMENT ON COLUMN landing_leads.extra_data IS 'Incluye extra_data.calculator con respuestas y resultado del wizard';
