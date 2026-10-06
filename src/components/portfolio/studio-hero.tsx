import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { CV_PUBLIC_PATH } from '../../config/cv';
import { PROFILE_PORTRAIT_PATH } from '../../config/profile';
import { getHomeCopy } from '../../data/home-copy';
import { useResume } from '../../data/use-resume';
import { useEffects } from './effects-context';
import { usePortfolio } from './use-portfolio';

export const StudioHero = () => {
  const { copy, i18n } = usePortfolio();
  const home = getHomeCopy(i18n.language);
  const resume = useResume();
  const { motionAllowed } = useEffects();
  const [portraitFailed, setPortraitFailed] = useState(false);
  return (
    <section
      className='identity-hero page-container'
      aria-labelledby='intro-title'
    >
      <motion.div
        className='identity-copy'
        initial={motionAllowed ? { opacity: 0.6, y: 18 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: motionAllowed ? 0.7 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <h1 id='intro-title' tabIndex={-1}>
          {resume.profile.name}
        </h1>
        <p className='identity-role'>{copy.introRole}</p>
        <p className='identity-description'>{copy.introDescription}</p>
        <div className='hero-actions'>
          <Link className='button button-primary' to='/projects'>
            {home.allProjects}
          </Link>
          <a className='button button-secondary' href={CV_PUBLIC_PATH} download>
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
      <motion.figure
        className='identity-portrait'
        initial={motionAllowed ? { opacity: 0.5, scale: 0.96 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: motionAllowed ? 0.8 : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
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
      </motion.figure>
    </section>
  );
};
