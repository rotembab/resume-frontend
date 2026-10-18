import { CSSProperties, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { CV_PUBLIC_PATH } from '../../config/cv';
import { PROFILE_PORTRAIT_PATH } from '../../config/profile';
import { getHomeCopy } from '../../data/home-copy';
import { useResume } from '../../data/use-resume';
import { useEffects } from './effects-context';
import { HeroScene } from './hero-scene';
import { usePortfolio } from './use-portfolio';

const ease = [0.22, 1, 0.36, 1] as const;

export const StudioHero = () => {
  const { copy, i18n } = usePortfolio();
  const home = getHomeCopy(i18n.language);
  const resume = useResume();
  const { motionAllowed } = useEffects();
  const [portraitFailed, setPortraitFailed] = useState(false);
  const words = resume.profile.name.split(' ');
  return (
    <section
      className='identity-hero page-container'
      aria-labelledby='intro-title'
      data-motion={motionAllowed ? 'on' : 'off'}
    >
      <div className='identity-copy'>
        <h1 id='intro-title' tabIndex={-1} aria-label={resume.profile.name}>
          {words.map((word, index) => (
            <span
              className='identity-word'
              key={word + index}
              aria-hidden='true'
            >
              <span style={{ '--word-index': index } as CSSProperties}>
                {word}
              </span>
            </span>
          ))}
        </h1>
        <motion.div
          className='identity-details'
          initial={motionAllowed ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionAllowed ? 0.8 : 0, delay: 0.35, ease }}
        >
          <p className='identity-role'>{copy.introRole}</p>
          <p className='identity-description'>{copy.introDescription}</p>
          <div className='hero-actions'>
            <Link className='button button-primary' to='/projects'>
              {home.allProjects}
              <span className='button-arrow' aria-hidden='true'>
                →
              </span>
            </Link>
            <a
              className='button button-secondary'
              href={CV_PUBLIC_PATH}
              download
            >
              {copy.downloadCv}
            </a>
          </div>
          <div className='identity-meta'>
            <p>{resume.profile.location}</p>
            <a
              href={resume.profile.social.github}
              target='_blank'
              rel='noreferrer'
            >
              GitHub
            </a>
            <a
              href={resume.profile.social.linkedin}
              target='_blank'
              rel='noreferrer'
            >
              LinkedIn
            </a>
          </div>
        </motion.div>
      </div>
      <motion.div
        className='identity-stage'
        initial={motionAllowed ? { opacity: 0, scale: 0.92 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: motionAllowed ? 1.1 : 0, ease }}
      >
        <HeroScene animate={motionAllowed} />
        <figure className='identity-portrait'>
          {portraitFailed ? (
            <span
              className='portrait-fallback'
              role='img'
              aria-label={resume.profile.name}
            >
              RB
            </span>
          ) : (
            <img
              src={PROFILE_PORTRAIT_PATH}
              alt={resume.profile.name}
              width={643}
              height={642}
              {...{ fetchpriority: 'high' }}
              decoding='async'
              onError={() => setPortraitFailed(true)}
            />
          )}
        </figure>
      </motion.div>
    </section>
  );
};
