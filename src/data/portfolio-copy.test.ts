import { describe, expect, it } from 'vitest';
import { getPortfolioCopy, type PortfolioCopy } from './portfolio-copy';

describe('portfolio interface copy', () => {
  it.each(['en', 'he', 'jp'])(
    'provides complete, nonempty interface labels in %s',
    (language) => {
      const copy = getPortfolioCopy(language);
      expect(Object.keys(copy).sort()).toEqual(
        Object.keys(getPortfolioCopy('en')).sort()
      );
      for (const [key, value] of Object.entries(copy)) {
        expect(value.trim(), `Missing ${language} label: ${key}`).not.toBe('');
      }
    }
  );

  it.each([
    ['he', /\p{Script=Hebrew}/u],
    ['jp', /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u],
  ] as const)('translates every interface label in %s', (language, script) => {
    for (const [key, value] of Object.entries(getPortfolioCopy(language))) {
      expect(value, `Untranslated ${language} label: ${key}`).toMatch(script);
    }
  });

  it('covers request illustrations, image failures and contact validation', () => {
    const requiredLabels: (keyof PortfolioCopy)[] = [
      'requestInput',
      'requestService',
      'requestResponse',
      'requestIllustration',
      'projectImageFallback',
      'contactSuccess',
      'contactError',
      'contactNameRequired',
      'contactEmailRequired',
      'contactInvalidEmail',
      'contactMessageRequired',
    ];
    for (const language of ['en', 'he', 'jp']) {
      const copy = getPortfolioCopy(language);
      for (const label of requiredLabels) {
        expect(copy[label]).toBeTruthy();
      }
    }
    expect(getPortfolioCopy('en').requestIllustration).toBe(
      'Illustrative request flow, not a live connection.'
    );
  });

  it('keeps the English mobile headline concise and the role explicit', () => {
    const copy = getPortfolioCopy('en');
    expect(copy.introTitle.length).toBeLessThanOrEqual(70);
    expect(copy.introRole).toBe('Full-stack developer');
  });

  it('accepts locale aliases and falls back to English for unknown languages', () => {
    expect(getPortfolioCopy('jp')).toEqual(getPortfolioCopy('ja-JP'));
    expect(getPortfolioCopy('he-IL')).toEqual(getPortfolioCopy('he'));
    expect(getPortfolioCopy('unsupported')).toEqual(getPortfolioCopy('en'));
  });
});
