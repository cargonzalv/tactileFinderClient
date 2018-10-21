import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import tileData from './tileData';

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    flexWrap: 'nowrap',
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: 'translateZ(0)',
    height:230,
    width: 2000,

  },
  title: {
    color: theme.palette.primary,
  },
  images: {
    width:"200px",
    height: 180,
  },titleBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 80%)',
  },
  imageContainer:{
    minWidth: 250,
    width: "50vw",
    maxWidth: 350
  }
  
});


function ImageGrid(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <GridList className={classes.gridList} cols={3} style={{ margin: 15 }}>
        {tileData.map(tile => (
          <GridListTile className={classes.imageContainer} key={tile.img}>
            <img className={classes.images} src={tile.img} alt={tile.title} />
           
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

ImageGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ImageGrid);