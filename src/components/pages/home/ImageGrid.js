import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Typography from "@material-ui/core/Typography";
import "./HomePage.css";
import Loading from "react-loading";


let colors = {
  green: "#008744",
  blue: "#0057e7",
  red: "#d62d20",
  yellow: "#ffa700",
  white: "#eee"
};
const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
    height: 220,
    width: 2000
  },
  title: {
    color: theme.palette.primary
  },
  images: {
    width: 180,
    height: 140
  },
  titleBar: {
    background:
      "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 80%)"
  },
  imageContainer: {
    minWidth: 200,
    width: "50vw",
    maxWidth: 250,
    cursor: "pointer",
    height: 200
  }
});

function ImageGrid(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <GridList className={classes.gridList} cols={3} style={{ margin: 15 }}>
        {props.data.map((tile, i) => (
          <GridListTile
            className={"gridTile " + classes.imageContainer}
            key={tile.img}
          >
            <img
              id={"img" + i}
              className={"image " + classes.images}
              onClick={ev => props.uploadImage(ev,i)}
              src={tile.img}
              alt={tile.title}
              crossOrigin="Anonymous"
            />
            {tile.score >= 80 && 
            <span className="stamp good">Great!</span>}
            {tile.score >= 30 && tile.score < 80 && 
            <span className="stamp">Fair</span>}
            {tile.score < 30 && 
            <span className="stamp bad">Bad</span>}
            {tile.score == undefined && 
                <Loading
                  className="loader"
                  type={"spinningBubbles"}
                  color={colors["blue"]}
                />
            }
          }

          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

ImageGrid.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ImageGrid);
