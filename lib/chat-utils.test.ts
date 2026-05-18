import { describe, it, expect } from 'vitest';
import { mergeCorrection, isValidHealth, validateCorrectionFields, buildSystemPrompt } from './chat-utils';
import type { Plant } from './types';

const basePlant: Plant = {
  id: 1,
  name: 'Basilico',
  latin: 'Ocimum basilicum',
  category: 'Aromatica',
  note: 'Cresce bene al sole',
  health: 'ok',
  image_path: '/images/plants/plant_01.jpg',
};

describe('isValidHealth', () => {
  it('accepts valid values', () => {
    expect(isValidHealth('ok')).toBe(true);
    expect(isValidHealth('warn')).toBe(true);
    expect(isValidHealth('bad')).toBe(true);
  });
  it('rejects invalid values', () => {
    expect(isValidHealth('good')).toBe(false);
    expect(isValidHealth('')).toBe(false);
    expect(isValidHealth('OK')).toBe(false);
  });
});

describe('mergeCorrection', () => {
  it('applies full suggestion', () => {
    const result = mergeCorrection(basePlant, {
      reasoning: 'test',
      name: 'Menta',
      latin: 'Mentha spicata',
      category: 'Aromatica',
      note: 'Cresce velocemente',
      health: 'warn',
    });
    expect(result).toEqual({
      name: 'Menta',
      latin: 'Mentha spicata',
      category: 'Aromatica',
      note: 'Cresce velocemente',
      health: 'warn',
    });
  });

  it('applies partial suggestion, keeps plant values for missing fields', () => {
    const result = mergeCorrection(basePlant, {
      reasoning: 'solo nome sbagliato',
      name: 'Basilico Genovese',
    });
    expect(result.name).toBe('Basilico Genovese');
    expect(result.latin).toBe(basePlant.latin);
    expect(result.category).toBe(basePlant.category);
    expect(result.health).toBe(basePlant.health);
  });

  it('ignores invalid health, keeps plant health', () => {
    const result = mergeCorrection(basePlant, {
      reasoning: 'test',
      health: 'critical',
    });
    expect(result.health).toBe(basePlant.health);
  });

  it('keeps all plant values for empty suggestion', () => {
    const result = mergeCorrection(basePlant, { reasoning: 'nessuna modifica' });
    expect(result).toEqual({
      name: basePlant.name,
      latin: basePlant.latin,
      category: basePlant.category,
      note: basePlant.note,
      health: basePlant.health,
    });
  });
});

describe('validateCorrectionFields', () => {
  it('returns typed object for valid fields', () => {
    const result = validateCorrectionFields({
      name: 'Basilico',
      latin: 'Ocimum basilicum',
      category: 'Aromatica',
      note: 'Al sole',
      health: 'ok',
    });
    expect(result).not.toBeNull();
    expect(result?.health).toBe('ok');
  });

  it('returns null for missing fields', () => {
    expect(validateCorrectionFields({ name: 'Basilico', latin: '', category: '', note: '', health: 'ok' })).toBeNull();
  });

  it('returns null for invalid health', () => {
    const result = validateCorrectionFields({
      name: 'Basilico',
      latin: 'Ocimum basilicum',
      category: 'Aromatica',
      note: 'Al sole',
      health: 'great',
    });
    expect(result).toBeNull();
  });
});

describe('buildSystemPrompt', () => {
  it('returns a non-empty Italian string containing plant data', () => {
    const prompt = buildSystemPrompt(basePlant);
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toContain('Basilico');
    expect(prompt).toContain('italiano');
  });
});
