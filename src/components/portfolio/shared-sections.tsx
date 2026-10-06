import { Link } from 'react-router';
import { usePortfolio } from './use-portfolio';
import { useResume } from '../../data/use-resume';
import { splitExperience } from '../pages/experience/experience-sections';
import { ContactForm } from '../pages/contact-me/contact-form.component';
import { CV_PUBLIC_PATH } from '../../config/cv';

export const ExperienceList = ({
  compact = false,
  education = false,
  featured = false,
  headingLevel = 'h3',
}: {
  compact?: boolean;
  education?: boolean;
  featured?: boolean;
  headingLevel?: 'h2' | 'h3';
}) => {
  const resume = useResume();
  const { jobs, education: studies } = splitExperience(resume.experience);
  const chronological = [...(education ? studies : jobs)].sort((a, b) =>
    b.period.start.localeCompare(a.period.start)
  );
  const entries =
    !education && compact ? chronological.slice(0, 2) : chronological;
  const Heading = headingLevel;
  return (
    <ol
      className={
        featured ? 'experience-list featured-experience' : 'experience-list'
      }
    >
      {entries.map((entry) => (
        <li className='experience-item' key={entry.id}>
          <article className='experience-entry' id={entry.id}>
            <div className='experience-metadata'>
              <p className='experience-period'>{entry.period.durationLabel}</p>
            </div>
            <div className='experience-content'>
              <div className='experience-heading'>
                <Heading tabIndex={-1}>{entry.organization}</Heading>
              </div>
              <p className='experience-role'>{entry.role}</p>
              <p>{entry.summary}</p>
              {(!compact || featured) && entry.highlights && (
                <ul>
                  {entry.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </li>
      ))}
    </ol>
  );
};
export const ContactSection = ({
  standalone = false,
}: {
  standalone?: boolean;
}) => {
  const { copy } = usePortfolio();
  const resume = useResume();
  const Heading = standalone ? 'h1' : 'h2';
  return (
    <section
      id='contact'
      className={
        standalone ? 'contact-section standalone-contact' : 'contact-section'
      }
      aria-labelledby='contact-title'
      data-studio-page={standalone ? 'contact' : undefined}
    >
      <div className='page-container contact-grid'>
        <div className='contact-copy'>
          <Heading id='contact-title' tabIndex={-1}>
            {copy.contactTitle}
          </Heading>
          <p>{copy.contactDescription}</p>
          <a
            className='contact-email'
            href={'mailto:' + resume.profile.social.email}
            dir='ltr'
          >
            {resume.profile.social.email}
            <span aria-hidden='true'>↗</span>
          </a>
          <div className='contact-socials'>
            <a
              href={resume.profile.social.linkedin}
              target='_blank'
              rel='noreferrer'
            >
              LinkedIn
            </a>
            <a
              href={resume.profile.social.github}
              target='_blank'
              rel='noreferrer'
            >
              GitHub
            </a>
            <a href={CV_PUBLIC_PATH} download>
              {copy.downloadCv}
            </a>
            {!standalone && <Link to='/contact'>{copy.emailMe}</Link>}
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
};
