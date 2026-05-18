import type { Plant, CorrectionFields, SuggestCorrectionInput } from './types';

const VALID_HEALTH = new Set(['ok', 'warn', 'bad']);

export function isValidHealth(value: string): value is 'ok' | 'warn' | 'bad' {
  return VALID_HEALTH.has(value);
}

export function mergeCorrection(plant: Plant, suggestion: SuggestCorrectionInput): CorrectionFields {
  return {
    name: suggestion.name ?? plant.name,
    latin: suggestion.latin ?? plant.latin,
    category: suggestion.category ?? plant.category,
    note: suggestion.note ?? plant.note,
    health: (suggestion.health && isValidHealth(suggestion.health))
      ? suggestion.health
      : plant.health,
  };
}

export function validateCorrectionFields(
  fields: Record<string, string>
): CorrectionFields | null {
  const { name, latin, category, note, health } = fields;
  if (!name || !latin || !category || !note || !health) return null;
  if (!isValidHealth(health)) return null;
  return { name, latin, category, note, health };
}

export function buildSystemPrompt(plant: Plant): string {
  return `Sei un botanico esperto. Stai analizzando la pianta "${plant.name}" (${plant.latin}), categoria: ${plant.category}.

Stato attuale di salute: ${plant.health}.
Note attuali: ${plant.note}

Il tuo compito è aiutare l'utente a correggere le informazioni di questa pianta se necessario. Analizza la foto e i dati esistenti, poi suggerisci correzioni usando lo strumento suggest_correction.

Rispondi sempre in italiano. Sii preciso e conciso.`;
}
