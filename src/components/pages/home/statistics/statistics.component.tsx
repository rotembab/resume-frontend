import { useGithubReposFetchAPI } from '../../../../hooks/github-fetchAPI.hook';
import { SingleStatistic } from '../../../ui/single-statistic/single-statistic.component';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { STAT_ANCHORS, yearsSince } from '../../../../config/stats';
export const Statistics = () => {
  const { t } = useTranslation();
  const getGithubReposQuery = useGithubReposFetchAPI();
  const fullStackYears = yearsSince(STAT_ANCHORS.fullStackStart);
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
          md: 6,
          lg: 6,
          xl: 6,
        }}
      >
        <SingleStatistic
          description={t(
            'Home.statistics.yearsOfExperienceInFullStackDevelopment'
          )}
          number={fullStackYears}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 12,
          md: 6,
          lg: 6,
          xl: 6,
        }}
      >
        <SingleStatistic
          description={t('Home.statistics.gitProjects')}
          number={getGithubReposQuery.data?.length ?? 0}
          loading={getGithubReposQuery.isLoading}
        />
      </Grid>
    </Grid>
  );
};
