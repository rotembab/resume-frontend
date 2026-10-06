import { useMemo } from 'react';
import { usePortfolio } from './use-portfolio';
import { useResume } from '../../data/use-resume';

export const useToolCards = () => {
  const { copy, projects } = usePortfolio();
  const resume = useResume();
  return useMemo(() => {
    const experienceEvidence = (id: string, technologies: string) => ({
      to: '/experience#' + id,
      title:
        resume.experience.find((entry) => entry.id === id)?.organization ?? id,
      technologies,
    });
    const projectEvidence = (slug: string, technologies: string) => ({
      to: '/projects/' + slug,
      title: projects.find((project) => project.slug === slug)?.title ?? slug,
      technologies,
    });
    const groups = [
      {
        title: copy.toolsProductTitle,
        names: [
          'React',
          'TypeScript',
          'JavaScript',
          'Next.js',
          'CSS',
          'HTML',
          'Mantine',
          'TanStack Query',
        ],
        evidence: [
          experienceEvidence(
            'voyager-labs',
            'React / TypeScript / Mantine / TanStack Query'
          ),
          experienceEvidence('izer', 'Next.js / React / TypeScript'),
          projectEvidence('cinema', 'React / JavaScript'),
        ],
      },
      {
        title: copy.toolsSystemsTitle,
        names: [
          'Java',
          'Kotlin',
          'Node.js',
          'Express',
          'Laravel',
          'MongoDB',
          'PHP',
          'Python',
          'C++',
        ],
        evidence: [
          experienceEvidence('voyager-labs', 'Kotlin / Java'),
          projectEvidence('hebrew-subtitle-studio', 'Node.js / Ollama'),
          experienceEvidence('izer', 'PHP / Laravel'),
          projectEvidence('esp32-claude-remote', 'Python / C++'),
          projectEvidence('cinema', 'Express / MongoDB'),
        ],
      },
      {
        title: copy.toolsDeliveryTitle,
        names: [
          'Git',
          'GitHub',
          'Docker',
          'Kubernetes',
          'Helm',
          'TestCafe',
          'Unreal Engine',
        ],
        evidence: [
          experienceEvidence('izer', 'Docker / Git'),
          experienceEvidence('voyager-labs', 'Kubernetes / Helm'),
          experienceEvidence('israel-defense-forces', 'TestCafe'),
          projectEvidence('blaster', 'Unreal Engine / C++'),
        ],
      },
    ];
    return groups.flatMap((group) =>
      group.names.map((name) => {
        const skill = resume.skills.find((entry) => entry.name === name);
        return {
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          summary: skill?.summary ?? group.title,
          category: group.title,
          iconKey:
            (name === 'Node.js' ? 'nodejs-clean' : skill?.iconKey) ??
            (
              {
                Kotlin: 'kotlin',
                Python: 'python',
                'C++': 'cpp',
                Express: 'express',
                'Unreal Engine': 'unreal-engine-clean',
              } as Record<string, string>
            )[name],
          link: skill?.link,
          evidence: group.evidence
            .filter((item) => item.technologies.split(' / ').includes(name))
            .map(({ to, title }) => ({ to, title })),
        };
      })
    );
  }, [copy, projects, resume]);
};
