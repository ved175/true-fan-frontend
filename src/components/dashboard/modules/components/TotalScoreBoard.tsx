import React, { useState, useEffect } from "react";
import SwipeableViews from "react-swipeable-views";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  Box,
  AppBar,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { map, sortBy, take, join } from "lodash-es";
import { IUserScore, ITournamentScore } from "../../../../api/DashboardAPI";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "90.00%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  expansionStyle: {
    padding: "1px 0px",
  },
  leagueTitle: {
    paddingTop: theme.spacing(2),
  },
  tabTitle: {
    backgroundColor: theme.palette.primary.light,
  },
  tabSelected: {
    color: theme.palette.primary.dark + " !important",
  },
}));

interface ITabPanelProps {
  children: JSX.Element | string;
  value: number;
  index: number;
  classes: string;
  [key: string]: string | number | JSX.Element;
}

function TabPanel(props: ITabPanelProps) {
  const { children, value, index, classes, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box className={classes}>{children}</Box>}
    </Typography>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

interface IScoreBoardProps {
  score: ITournamentScore;
}

function ScoreBoard(props: IScoreBoardProps) {
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const tabCustomStyles = {
    selected: classes.tabSelected,
  };
  const {
    score: { tournament, scores },
  } = props;

  const [survivoreScores, setSurvivorScores] = useState([] as IUserScore[]);
  const [confidenceScores, setConfidenceScores] = useState([] as IUserScore[]);

  useEffect(() => {
    setSurvivorScores(take(sortBy(scores, ["tournamentSurvivorRank"]), 10));
    setConfidenceScores(take(sortBy(scores, ["tournamentConfidenceRank"]), 10));
  }, [scores]);

  const handleChange = (event: object, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <Grid item className={classes.root} xs={12} md={6}>
      <AppBar
        position="static"
        color="primary"
        classes={{
          colorPrimary: classes.tabTitle,
        }}
      >
        <Typography className={classes.leagueTitle} variant="h5" noWrap>
          {tournament}
        </Typography>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Survivor" {...a11yProps(0)} classes={tabCustomStyles} />
          <Tab label="Confidence" {...a11yProps(1)} classes={tabCustomStyles} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === "rtl" ? "x-reverse" : "x"}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel
          value={value}
          index={0}
          dir={theme.direction}
          classes={classes.expansionStyle}
        >
          <>
            {map(survivoreScores, (score, rank) => (
              <Accordion square key={score.username}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography
                    className={classes.secondaryHeading}
                    variant="subtitle2"
                  >
                    #{rank + 1}
                  </Typography>
                  <Typography className={classes.heading} variant="subtitle1">
                    {`${score.username} - ${score.tournamentLeague
                      .split("/")
                      .splice(1)
                      .join()}`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justify="center">
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Summary</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        Strikes: {score.strikes}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        Lost Matches:{" "}
                        {join(
                          map(score.lostMatches, (m) => `#${m}`),
                          " "
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        </TabPanel>
        <TabPanel
          value={value}
          index={1}
          dir={theme.direction}
          classes={classes.expansionStyle}
        >
          <>
            {map(confidenceScores, (score, rank) => (
              <Accordion square key={score.username}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography
                    className={classes.secondaryHeading}
                    variant="subtitle2"
                  >
                    #{rank + 1}
                  </Typography>
                  <Typography className={classes.heading} variant="subtitle1">
                    {`${score.username} - ${score.tournamentLeague
                      .split("/")
                      .splice(1)
                      .join()}`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justify="center">
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Summary</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        Confidence Score: {score.confidenceScore}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body1">
                        Remaining Points: {score.remainingPoints}
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        </TabPanel>
      </SwipeableViews>
    </Grid>
  );
}

export default React.memo(ScoreBoard);
