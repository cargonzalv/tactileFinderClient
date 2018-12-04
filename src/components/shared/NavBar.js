import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import BackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import logo from "../../images/LogoNoTaglineNoBG.png";
const styles = {
  root: {
    flexGrow: 1,
    marginBottom:10,
  },
  bar: {
  },
  logo:{
      marginLeft:"50vw",
      height:"50px",
      transform: "translate(-240px,0)",
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

function SimpleAppBar(props) {
  const { classes } = props;

  const handleBack = () =>{
    props.history.push({
        pathname: '/',
    })
  }
  return (
    <div className={classes.root}>
      <AppBar className={classes.bar} position="static" color="default">
        <Toolbar>
        <IconButton onClick={handleBack} className={classes.menuButton} color="inherit" aria-label="Menu">
              <BackIcon />
            </IconButton>
          <Typography variant="h6" color="inherit">
            <img className={classes.logo} src={logo}/>
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

SimpleAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleAppBar);