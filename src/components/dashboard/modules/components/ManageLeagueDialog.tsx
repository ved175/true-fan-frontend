import React, { useState, useEffect } from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import ChipInput from 'material-ui-chip-input';
import LeagueAPI, { ICreateLeaguePayload } from '../../../../api/LeagueAPI';
import { reducers } from '../../../../reducers';
import { useSelector } from 'react-redux';
import { cloneDeep, map, get } from 'lodash-es';
import isEmail from 'validator/lib/isEmail';

const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            padding: theme.spacing(2),
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
    });

export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
    },
}))(MuiDialogActions);

interface IManageLeagueDialogProps {
    league: ICreateLeaguePayload;
    open: boolean;
    handleClose: () => void;
}

export default function ManageLeagueDialog(props: IManageLeagueDialogProps) {

    const [members, setMembers] = useState([] as string[]);
    const store: any = useSelector((state: reducers) => state.LeagueReducer);
    // const dispatch = useDispatch();

    console.log("selectedLeague", props.league);

    // constructor and destructor
    useEffect(() => {
        return function cleanup() {
            setMembers([]);
        }
    }, []);

    // store watcher
    useEffect(() => {
        const updateMembers = async () => {
            const response = await store.members;
            console.log(JSON.stringify(response), map(get(response, "result.Items"), "userId"));
            setMembers(map(get(response, "result.Items", {}), "userId"));
        }
        updateMembers();
    }, [store]);

    const chipMembers = cloneDeep(members);

    const addMember = (member: string) => {
        chipMembers.push(member);
        setMembers(chipMembers);
    }
    const removeMember = (index: number) => {
        chipMembers.splice(index, 1);
        setMembers(chipMembers);
    }

    const saveChanges = () => {
        console.log(members);
        LeagueAPI.setLeagueMembers(props.league.leagueName, members)
            .then(response => {
                setMembers(map(get(response, "result.Items", {}), "userId"));
                props.handleClose();
            })
            .catch(error => {
                console.log(error);
            });
    }

    return (
        <Dialog onClose={props.handleClose} aria-labelledby="customized-dialog-title" open={props.open}>
            <DialogTitle id="customized-dialog-title" onClose={props.handleClose}>
                {props.league.leagueName}
            </DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>
                    You can invite people to play in your Private League. Just enter their Email's below.
                </Typography>
                <ChipInput
                    defaultValue={chipMembers}
                    value={members}
                    onAdd={(chip) => (isEmail(chip) && addMember(chip))}
                    onDelete={(chip, index) => removeMember(index)}
                    fullWidth={true}
                    newChipKeys={['Enter', ' ', ',']}
                    fullWidthInput={true}
                    placeholder="abc@xyz.com"
                    label="Emails"
                />
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={() => saveChanges()} color="primary">
                    Save changes
          </Button>
            </DialogActions>
        </Dialog>
    );
}