import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProjects } from '../../data/projects';
import {
  getWalkthroughCopy,
  WALKTHROUGH_STEPS,
} from '../../data/subtitle-walkthrough';
import { SubtitleWalkthrough } from './subtitle-walkthrough';

const state = vi.hoisted(() => ({ language: 'en', motionAllowed: true }));

vi.mock('./use-portfolio', () => ({
  usePortfolio: () => ({
    i18n: {
      language: state.language,
      dir: () => (state.language.startsWith('he') ? 'rtl' : 'ltr'),
    },
  }),
}));
vi.mock('./effects-context', () => ({
  useEffects: () => ({ motionAllowed: state.motionAllowed }),
}));

const Walkthrough = () => (
  <SubtitleWalkthrough project={getProjects(state.language)[0]} />
);
const stepTabs = () =>
  within(
    screen.getByRole('tablist', {
      name: getWalkthroughCopy(state.language).stepsLabel,
    })
  );
const viewTabs = () =>
  within(
    screen.getByRole('tablist', {
      name: getWalkthroughCopy(state.language).viewLabel,
    })
  );

beforeEach(() => {
  state.language = 'en';
  state.motionAllowed = true;
});
afterEach(cleanup);

describe('Subtitle Studio guided walkthrough', () => {
  it('defaults to the authentic interface and import step with linked tab semantics', () => {
    const { container } = render(<Walkthrough />);
    expect(viewTabs().getByRole('tab', { name: 'Interface' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(stepTabs().getByRole('tab', { name: 'Import' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      getProjects('en')[0].image
    );
    expect(screen.getByRole('img')).toHaveAccessibleName(
      getProjects('en')[0].imageAlt
    );
    expect(
      screen.getByText(getWalkthroughCopy('en').steps.import.interface)
    ).toBeVisible();
    expect(screen.getByText(getWalkthroughCopy('en').imageNote)).toBeVisible();
    expect(screen.getByText(getWalkthroughCopy('en').note)).toBeVisible();
    expect(container.querySelector('.walkthrough-highlight')).toHaveAttribute(
      'data-region',
      'import'
    );
    for (const tab of screen.getAllByRole('tab', { hidden: true })) {
      const panel = document.getElementById(tab.getAttribute('aria-controls')!);
      expect(panel).toHaveAttribute('role', 'tabpanel');
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    }
  });

  it('supports arrow, Home and End navigation while updating the caption and focus region together', async () => {
    const user = userEvent.setup();
    const { container } = render(<Walkthrough />);
    stepTabs().getByRole('tab', { name: 'Import' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(
      stepTabs().getByRole('tab', { name: 'Local processing' })
    ).toHaveFocus();
    expect(
      screen.getByText(getWalkthroughCopy('en').steps.process.interface)
    ).toBeVisible();
    expect(container.querySelector('.walkthrough-highlight')).toHaveAttribute(
      'data-region',
      'process'
    );
    await user.keyboard('{End}');
    expect(stepTabs().getByRole('tab', { name: 'Export' })).toHaveFocus();
    expect(
      screen.getByText(getWalkthroughCopy('en').steps.export.interface)
    ).toBeVisible();
    expect(container.querySelector('.walkthrough-highlight')).toHaveAttribute(
      'data-region',
      'export'
    );
    await user.keyboard('{ArrowRight}');
    expect(stepTabs().getByRole('tab', { name: 'Import' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(stepTabs().getByRole('tab', { name: 'Export' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(stepTabs().getByRole('tab', { name: 'Import' })).toHaveFocus();
  });

  it('preserves the chosen step when switching views and exposes the architecture as readable HTML', async () => {
    const user = userEvent.setup();
    const { container } = render(<Walkthrough />);
    await user.click(stepTabs().getByRole('tab', { name: 'Validate' }));
    viewTabs().getByRole('tab', { name: 'Interface' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(
      viewTabs().getByRole('tab', { name: 'Behind the interface' })
    ).toHaveFocus();
    expect(stepTabs().getByRole('tab', { name: 'Validate' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(
      screen.getByText(getWalkthroughCopy('en').steps.validate.behind)
    ).toBeVisible();
    expect(screen.getByRole('list')).toBeVisible();
    expect(
      screen.getByRole('group', {
        name: getWalkthroughCopy('en').diagramLabel,
      })
    ).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(
      screen.getByRole('heading', { name: 'Local Node.js server' })
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Local Ollama model' })
    ).toBeVisible();
    expect(container.querySelector('[data-node="validation"]')).toHaveAttribute(
      'aria-current',
      'step'
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    await user.keyboard('{Home}');
    expect(viewTabs().getByRole('tab', { name: 'Interface' })).toHaveFocus();
    expect(
      screen.getByText(getWalkthroughCopy('en').steps.validate.interface)
    ).toBeVisible();
    expect(container.querySelector('.walkthrough-highlight')).toHaveAttribute(
      'data-region',
      'validate'
    );
    await user.keyboard('{End}');
    expect(
      viewTabs().getByRole('tab', { name: 'Behind the interface' })
    ).toHaveFocus();
  });

  it('lets direct pointer or touch activation select every step with the matching explanation', async () => {
    const user = userEvent.setup();
    const { container } = render(<Walkthrough />);
    await user.click(
      viewTabs().getByRole('tab', { name: 'Behind the interface' })
    );
    for (const step of WALKTHROUGH_STEPS) {
      await user.click(
        stepTabs().getByRole('tab', {
          name: getWalkthroughCopy('en').steps[step.id].label,
        })
      );
      expect(
        screen.getByText(getWalkthroughCopy('en').steps[step.id].behind)
      ).toBeVisible();
      expect(container.querySelector('.walkthrough-visual')).toHaveAttribute(
        'data-step',
        step.id
      );
      expect(
        [
          ...container.querySelectorAll(
            '.walkthrough-node[data-active="true"]'
          ),
        ].map((node) => node.getAttribute('data-node'))
      ).toEqual(step.nodes);
    }
  });

  it('keeps the focused control and selected step on language changes and follows RTL arrow direction', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Walkthrough />);
    await user.click(stepTabs().getByRole('tab', { name: 'Review' }));
    const focusedTab = stepTabs().getByRole('tab', { name: 'Review' });
    expect(focusedTab).toHaveFocus();
    state.language = 'he';
    rerender(<Walkthrough />);
    expect(
      stepTabs().getByRole('tab', {
        name: getWalkthroughCopy('he').steps.review.label,
      })
    ).toBe(focusedTab);
    expect(focusedTab).toHaveFocus();
    expect(
      screen.getByText(getWalkthroughCopy('he').steps.review.interface)
    ).toBeVisible();
    await user.keyboard('{ArrowRight}');
    expect(
      stepTabs().getByRole('tab', {
        name: getWalkthroughCopy('he').steps.validate.label,
      })
    ).toHaveFocus();
    state.language = 'jp';
    rerender(<Walkthrough />);
    expect(
      stepTabs().getByRole('tab', {
        name: getWalkthroughCopy('jp').steps.validate.label,
      })
    ).toHaveFocus();
    expect(
      screen.getByText(getWalkthroughCopy('jp').steps.validate.interface)
    ).toBeVisible();
  });

  it('retains captions and the architecture view when the screenshot cannot load', async () => {
    const user = userEvent.setup();
    render(<Walkthrough />);
    fireEvent.error(screen.getByRole('img'));
    expect(
      screen.getByText(getWalkthroughCopy('en').imageUnavailable)
    ).toBeVisible();
    expect(
      screen.getByText(getWalkthroughCopy('en').steps.import.interface)
    ).toBeVisible();
    await user.click(
      viewTabs().getByRole('tab', { name: 'Behind the interface' })
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('exposes the effects preference without requiring motion to change state', async () => {
    const user = userEvent.setup();
    state.motionAllowed = false;
    render(<Walkthrough />);
    expect(screen.getByRole('region')).toHaveAttribute(
      'data-motion',
      'reduced'
    );
    await user.click(stepTabs().getByRole('tab', { name: 'Export' }));
    expect(
      screen.getByText(getWalkthroughCopy('en').steps.export.interface)
    ).toBeVisible();
  });
});

describe('Walkthrough localized copy', () => {
  const leaves = (value: unknown): string[] =>
    typeof value === 'string'
      ? [value]
      : Object.values(value as Record<string, unknown>).flatMap(leaves);

  it.each([
    ['he', /\p{Script=Hebrew}/u],
    ['jp', /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u],
  ] as const)(
    'provides translated text for every %s interface label and explanation',
    (language, script) => {
      expect(leaves(getWalkthroughCopy(language))).toHaveLength(
        leaves(getWalkthroughCopy('en')).length
      );
      for (const text of leaves(getWalkthroughCopy(language)))
        expect(text).toMatch(script);
    }
  );

  it('accepts locale aliases and falls back to English', () => {
    expect(getWalkthroughCopy('he-IL')).toBe(getWalkthroughCopy('he'));
    expect(getWalkthroughCopy('ja-JP')).toBe(getWalkthroughCopy('jp'));
    expect(getWalkthroughCopy('unsupported')).toBe(getWalkthroughCopy('en'));
  });
});
