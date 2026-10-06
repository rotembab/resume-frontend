import { type KeyboardEvent, useId, useRef, useState } from 'react';
import type { PortfolioProject } from '../../data/projects';
import {
  getWalkthroughCopy,
  WALKTHROUGH_NODES,
  WALKTHROUGH_STEPS,
  type WalkthroughView,
} from '../../data/subtitle-walkthrough';
import { useEffects } from './effects-context';
import { usePortfolio } from './use-portfolio';

const views: WalkthroughView[] = ['interface', 'behind'];

export const SubtitleWalkthrough = ({
  project,
}: {
  project: PortfolioProject;
}) => {
  const { i18n } = usePortfolio();
  const { motionAllowed } = useEffects();
  const copy = getWalkthroughCopy(i18n.language);
  const id = useId();
  const [view, setView] = useState<WalkthroughView>('interface');
  const [step, setStep] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const viewTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stepTabs = useRef<
    Record<WalkthroughView, (HTMLButtonElement | null)[]>
  >({ interface: [], behind: [] });
  const rtl = i18n.dir() === 'rtl';

  const moveTab = (
    event: KeyboardEvent<HTMLButtonElement>,
    current: number,
    count: number,
    choose: (index: number) => void,
    buttons: (HTMLButtonElement | null)[]
  ) => {
    let next: number;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else if (event.key === 'ArrowRight')
      next = (current + (rtl ? -1 : 1) + count) % count;
    else if (event.key === 'ArrowLeft')
      next = (current + (rtl ? 1 : -1) + count) % count;
    else return;
    event.preventDefault();
    choose(next);
    buttons[next]?.focus();
  };

  return (
    <section
      className='subtitle-walkthrough'
      aria-labelledby={`${id}-title`}
      data-motion={motionAllowed ? 'full' : 'reduced'}
    >
      <div className='walkthrough-heading'>
        <p className='walkthrough-eyebrow'>{copy.eyebrow}</p>
        <h3 id={`${id}-title`}>{copy.title}</h3>
        <p>{copy.description}</p>
      </div>
      <div
        className='walkthrough-views'
        role='tablist'
        aria-label={copy.viewLabel}
      >
        {views.map((mode, index) => (
          <button
            key={mode}
            className='walkthrough-view-tab'
            type='button'
            role='tab'
            id={`${id}-${mode}-tab`}
            aria-controls={`${id}-${mode}-panel`}
            aria-selected={view === mode}
            tabIndex={view === mode ? 0 : -1}
            ref={(button) => {
              viewTabs.current[index] = button;
            }}
            onClick={() => setView(mode)}
            onKeyDown={(event) =>
              moveTab(
                event,
                index,
                views.length,
                (next) => setView(views[next]),
                viewTabs.current
              )
            }
          >
            {copy.views[mode]}
          </button>
        ))}
      </div>
      {views.map((mode) => (
        <div
          className='walkthrough-view'
          key={mode}
          role='tabpanel'
          id={`${id}-${mode}-panel`}
          aria-labelledby={`${id}-${mode}-tab`}
          hidden={view !== mode}
        >
          <div
            className='walkthrough-steps'
            role='tablist'
            aria-label={copy.stepsLabel}
          >
            {WALKTHROUGH_STEPS.map((item, index) => (
              <button
                key={item.id}
                className='walkthrough-step'
                type='button'
                role='tab'
                id={`${id}-${mode}-${item.id}-tab`}
                aria-controls={`${id}-${mode}-${item.id}-panel`}
                aria-selected={step === index}
                tabIndex={step === index ? 0 : -1}
                ref={(button) => {
                  stepTabs.current[mode][index] = button;
                }}
                onClick={() => setStep(index)}
                onKeyDown={(event) =>
                  moveTab(
                    event,
                    index,
                    WALKTHROUGH_STEPS.length,
                    setStep,
                    stepTabs.current[mode]
                  )
                }
              >
                <span className='walkthrough-step-index' aria-hidden='true'>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{copy.steps[item.id].label}</span>
              </button>
            ))}
          </div>
          {WALKTHROUGH_STEPS.map((item, index) => (
            <div
              key={item.id}
              className='walkthrough-step-panel'
              role='tabpanel'
              id={`${id}-${mode}-${item.id}-panel`}
              aria-labelledby={`${id}-${mode}-${item.id}-tab`}
              tabIndex={0}
              hidden={step !== index}
              data-step={item.id}
            >
              {view === mode && step === index && (
                <div
                  className='walkthrough-visual'
                  data-view={mode}
                  data-step={item.id}
                >
                  {mode === 'interface' ? (
                    <figure className='walkthrough-screenshot'>
                      <div className='walkthrough-capture'>
                        {imageFailed ? (
                          <p className='walkthrough-image-fallback'>
                            {copy.imageUnavailable}
                          </p>
                        ) : (
                          <>
                            <img
                              src={project.image}
                              alt={project.imageAlt}
                              width={1440}
                              height={1000}
                              loading='lazy'
                              onError={() => setImageFailed(true)}
                            />
                            <span
                              className='walkthrough-highlight'
                              data-region={item.id}
                              aria-hidden='true'
                              style={{
                                left: `${item.region.left}%`,
                                top: `${item.region.top}%`,
                                width: `${item.region.width}%`,
                                height: `${item.region.height}%`,
                              }}
                            >
                              <span className='walkthrough-marker'>
                                {index + 1}
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                      <figcaption className='walkthrough-image-note'>
                        {copy.imageNote}
                      </figcaption>
                    </figure>
                  ) : (
                    <div
                      className='walkthrough-diagram'
                      role='group'
                      aria-label={copy.diagramLabel}
                    >
                      <ol className='walkthrough-nodes'>
                        {WALKTHROUGH_NODES.map((node, nodeIndex) => (
                          <li
                            className='walkthrough-node'
                            key={node}
                            data-node={node}
                            data-active={item.nodes.includes(node)}
                            aria-current={
                              item.nodes.includes(node) ? 'step' : undefined
                            }
                          >
                            <span
                              className='walkthrough-node-index'
                              aria-hidden='true'
                            >
                              {String(nodeIndex + 1).padStart(2, '0')}
                            </span>
                            <h4>{copy.nodes[node].label}</h4>
                            <p>{copy.nodes[node].description}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
              <div
                className='walkthrough-caption'
                aria-live='polite'
                aria-atomic='true'
              >
                <h4>{copy.steps[item.id].label}</h4>
                <p>{copy.steps[item.id][mode]}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
      <p className='walkthrough-note'>{copy.note}</p>
    </section>
  );
};
