import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Typography from "@material-ui/core/Typography";
import "./HomePage.css";
import Loading from "react-loading";
import { fromBits } from "long";

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
  loaderContainer: {
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

function toDataURL(src, callback) {
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function() {
    var canvas = document.createElement("CANVAS");
    var ctx = canvas.getContext("2d");
    var dataURL;
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    ctx.drawImage(this, 0, 0);
    dataURL = canvas.toDataURL("image/jpg");
    callback(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
  };
  img.src = src;
  if (img.complete || img.complete === undefined) {
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    img.src = src;
  }
}

class ImageGrid extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        {!this.props.predicting ? (
          <GridList
            ref={this.grid}
            className={classes.gridList}
            cols={3}
            style={{
              margin: 15
            }}
          >
            {this.props.data.map((tile, i) => (
              <GridListTile
                className={"gridTile " + classes.imageContainer}
                key={tile.img}
              >
                <img
                  crossOrigin="Anonymous"
                  id={"img" + i}
                  className={"image " + classes.images}
                  onClick={ev => this.props.uploadImage(ev, i)}
                  src={tile.img}
                  alt={tile.title}
                />{" "}
                {tile.score >= 80 && (
                  <span className="stamp good"> Great! </span>
                )}{" "}
                {tile.score >= 30 && tile.score < 80 && (
                  <span className="stamp"> Fair </span>
                )}{" "}
                {tile.score < 30 && <span className="stamp bad"> Bad </span>}{" "}
              </GridListTile>
            ))}{" "}
          </GridList>
        ) : (
          <div className={classes.loaderContainer}>
            <Loading
              className="loader"
              type={"spinningBubbles"}
              color={colors["blue"]}
            />
          </div>
        )}{" "}
      </div>
    );
  }
}

ImageGrid.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ImageGrid);
