import { useGithubReposFetchAPI } from '../../../../hooks/github-fetchAPI.hook';
import { SingleStatistic } from '../../../ui/single-statistic/single-statistic.component';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
export const Statistics = () => {
  const { t } = useTranslation();
  const getGithubReposQuery = useGithubReposFetchAPI();
  return (
    <Grid
      spacing={2}
      sx={{
        '@media (max-width: 900px)': {
          textAlign: 'center',
        },
      }}
      container
    >
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4,
        }}
      >
        <SingleStatistic
          description={t(
            'Home.statistics.yearsOfExperienceInFullStackDevelopment'
          )}
          number={2}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4,
        }}
      >
        <SingleStatistic
          description={t('Home.statistics.yearsOfExperienceInGameDevelopment')}
          number={2}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 4,
          lg: 4,
          xl: 4,
        }}
      >
        <SingleStatistic
          description={t('Home.statistics.gitProjects')}
          number={getGithubReposQuery.data?.length ?? 8}
        />
      </Grid>
    </Grid>
  );
};
