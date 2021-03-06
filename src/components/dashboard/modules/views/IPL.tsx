import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Container from "@material-ui/core/Container";
import Intro from "../components/Intro";
import JumboButton from "../components/JumboButton";
import { URL } from "../../../../Routes";
import CreateLeagueDialog from "../components/CreateLeagueDialog";
import {
  cloneDeep,
  isEmpty,
  reduce,
  map,
  sortBy,
  reverse,
  get,
} from "lodash-es";
import { check } from "../../../landing/modules/form/validation";
import LeagueAPI, { ILeague } from "../../../../api/LeagueAPI";
import { LEAGUE_ACTIONS } from "../../../../reducers/LeagueReducer";
import { useDispatch, useSelector } from "react-redux";
import CardListItem from "../components/CardListItem";
import { reducers } from "../../../../reducers";
import { Paper } from "@material-ui/core";
import Title from "../components/Title";
import ManageLeagueDialog from "../components/ManageLeagueDialog";

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    marginTop: theme.spacing(3),
  },
  leaguesSection: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
}));

interface IDashboardProps {
  isAuthenticated: boolean;
  userHasAuthenticated: (isAuthenticated: boolean) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  history: any;
}

export default function IPL(props: IDashboardProps) {
  if (!props.isAuthenticated) props.history.push(URL.HOME);
  const classes = useStyles();
  const dispatch = useDispatch();
  const store: any = useSelector((state: reducers) => state.LeagueReducer);
  const [adminLeagues, setAdminLeagues] = useState([] as ILeague[]);
  const [userLeagues, setUserLeagues] = useState([] as ILeague[]);
  const [selectedLeague, setSelectedLeague] = useState({} as ILeague);
  const [isCreateOpen, openCreate] = useState(false);
  const [isManageOpen, openManage] = useState(false);

  const tournament = "IPL-2020"; // TODO: Refactor later

  const [formFields, setFormField] = useState({
    leagueName: "",
    description: "",
  });

  const [helperTexts, setHelperText] = useState({
    leagueName: "",
    description: "",
  });

  // constructor and destructor
  useEffect(() => {
    const getUserLeagues = async () => {
      dispatch({ type: LEAGUE_ACTIONS.GET_USER_LEAGUES });
    };
    getUserLeagues();
    return function cleanup() {
      dispatch({ type: LEAGUE_ACTIONS.RESET });
    };
  }, [dispatch]);

  // store watcher
  useEffect(() => {
    const updateUserLeagues = async () => {
      const leagues = await store.user_leagues;
      const sortedAdminLeagues = reverse(
        sortBy(
          get(leagues, "result.Items[0].adminLeagues"),
          (l) => l.created || ""
        )
      );
      const sortedUserLeagues = reverse(
        sortBy(
          get(leagues, "result.Items[0].userLeagues"),
          (l) => l.created || ""
        )
      );
      setAdminLeagues(sortedAdminLeagues);
      setUserLeagues(sortedUserLeagues);
    };
    updateUserLeagues();
  }, [store.user_leagues]);

  const fields = [
    { id: "leagueName", label: "League Name" },
    { id: "description", label: "Description" },
    // { id: "leagueType", label: "Type" },
  ];

  const validate = () => {
    const errors = cloneDeep(helperTexts);
    check(isEmpty(formFields.leagueName), "leagueName", "Required", errors);
    check(
      !/^[A-Za-z0-9-]*$/.test(formFields.leagueName.trim()) ||
        formFields.leagueName.trim().length > 20,
      "leagueName",
      "Only less than 20 characters, numbers, and dashes allowed",
      errors
    );

    setHelperText(errors);
    return reduce(
      errors,
      (acc, value) => {
        return acc && isEmpty(value);
      },
      true
    );
  };

  const createLeague = async () => {
    if (validate()) {
      const payload: ILeague = {
        ...formFields,
        tournament,
        totalPowerPlayPoints: 3000,
        userId: "", // will be set later in LeagueAPI
      };
      LeagueAPI.create(payload)
        .then(() => {
          openCreate(false);
          dispatch({ type: LEAGUE_ACTIONS.GET_USER_LEAGUES });
        })
        .catch((err) => {
          const errors = cloneDeep(helperTexts);
          if (err.response.data.error.message === "Already Exists") {
            check(
              true,
              "leagueName",
              "League already exists! Please choose a different name.",
              errors
            );
          } else {
            check(
              true,
              "leagueName",
              "Something went wrong! Please try again.",
              errors
            );
          }
          setHelperText(errors);
          console.log(err.response.data.error.message);
        });
    }
  };

  const navigateToLeague = (leagueName: string) => {
    const url = URL.LEAGUES.SURVIVOR.replace(":game", tournament).replace(
      ":league",
      leagueName
    );
    props.history.push(url);
  };

  return (
    <React.Fragment>
      <Container maxWidth="lg" className={classes.mainGrid}>
        <main>
          <Intro
            title={tournament}
            description=""
            image="https://source.unsplash.com/oDs_AxeR5g4"
            imgText="main image description"
            linkText=""
          />
          <Grid container spacing={4}>
            <JumboButton
              title={`Create a league for ${tournament}`}
              description=""
              image="https://source.unsplash.com/ghxL3qOfkPo"
              imgText="main image description"
              onClick={() => openCreate(true)}
            />
            {/* <JumboButton
              title="Public Leagues coming soon"
              description=""
              image="https://source.unsplash.com/mUtQXjjLPbw"
              imgText="main image description"
              onClick={() => console.log("Join public")}
            /> */}
          </Grid>
          <Grid container spacing={4}>
            {!isEmpty(adminLeagues) && (
              <Grid item xs={12}>
                <Paper elevation={3} className={classes.leaguesSection}>
                  <Title title="Leagues you own" />
                  <Grid container spacing={2}>
                    {map(adminLeagues, (league) => (
                      <Grid item xs={12} key={league.leagueName}>
                        <CardListItem
                          title={league.leagueName}
                          description={league.description}
                          owner={league.userId}
                          onClick={() => navigateToLeague(league.leagueName)}
                          onOptionsClick={() => {
                            setSelectedLeague(league);
                            dispatch({
                              type: LEAGUE_ACTIONS.GET_LEAGUE_MEMBERS,
                              tournament,
                              leagueName: league.leagueName,
                            });
                            openManage(true);
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
            <Grid item xs={12}>
              <Paper elevation={3} className={classes.leaguesSection}>
                <Title title="League invites" />
                <Grid container spacing={2}>
                  {!isEmpty(userLeagues) ? (
                    map(userLeagues, (league) => (
                      <Grid item xs={12} key={league.leagueName}>
                        <CardListItem
                          title={league.leagueName}
                          description={league.description}
                          owner={league.userId}
                          onClick={() => navigateToLeague(league.leagueName)}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      You are not invited to any Leagues yet
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
          <CreateLeagueDialog<{ leagueName: string; description: string }>
            open={isCreateOpen}
            fields={fields}
            formFields={formFields}
            setFormField={setFormField}
            helperTexts={helperTexts}
            handleClose={() => openCreate(false)}
            handleSubmit={createLeague}
            type={tournament}
          />
          <ManageLeagueDialog
            open={isManageOpen}
            league={selectedLeague}
            handleClose={() => openManage(false)}
          />
        </main>
      </Container>
    </React.Fragment>
  );
}
