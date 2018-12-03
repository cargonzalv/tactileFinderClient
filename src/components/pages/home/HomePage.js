import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import tileData from "./tileData";
import { TFModel } from "../../../TFModel.js";

import "./HomePage.css";
import Footer from "../../shared/HomeFooter";
import logo from "../../../images/Logo.png";
import { withRouter } from "react-router-dom";
import ImageGrid from "./ImageGrid";

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: "2.5em"
  },
  button: {
    padding: theme.spacing.unit * 1,
    textAlign: "center"
  },
  buttonSearch: {
    padding: theme.spacing.unit * 1.25,
    textAlign: "center"
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: "center",
    color: theme.palette.text.secondary
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  title: {
    fontSize: "6rem",
    fontWeight: 300,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: "1.14286em",
    marginLeft: "-.04em",
    letterSpacing: "-.04em"
  },
  train: {
    right: "10vw",
    position: "absolute"
  },
  loaderContainer: {
    position: "fixed" /* Sit on top of the page content */,
    display: "block" /* Hidden by default */,
    width: "100%" /* Full width (cover the whole page) */,
    height: "100%" /* Full height (cover the whole page) */,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)" /* Black background with opacity */,
    zIndex: 1000 /* Specify a stack order in case you're using a different order for other  */
  },
  loader: {
    position: "relative" /* Sit on top of the page content */,
    width: "200px" /* Full width (cover the whole page) */,
    height: "200px",
    top: "40%",
    left: "50%",
    transform: "translate(-50%,-50%)"
  },
  loaderText: {
    position: "relative" /* Sit on top of the page content */,
    width: "20%" /* Full width (cover the whole page) */,
    height: "200px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    zIndex: 1001,
    fontSize: 12,
    color: "white"
  }
});

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  state = {
    name: "",
    data: tileData,
    typing: false,
    typingTimeout: 0,
    loadingModel: true,
    predicting: false,
    predictions: 0,
    showLoader: true,
    changeTimeout: 0,
    result: {}
  };

  addImages = urls => {
    //se cargaron todas las imagenes
    console.log("lala");
    if (urls.length > 0) {
      console.log("finished");
      console.log("requesting...");
      this.setState({ predicting: true });
      fetch("https://tactiled.firebaseapp.com/api/predictMultiple", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: urls
        })
      })
        .then(resp => resp.json())
        .then(json => {
          console.log(json);
          let data = this.state.data;

          data.map((d, i) => {
            d.score = json.data[i].probability;
          });

          this.setState({ data: data, predictin: false });
        });
    }
  };

  handleChange = event => {
    event.persist();
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }
    console.log(event);
    this.setState({
      name: event.target.value,
      typing: false,
      typingTimeout: setTimeout(() => {
        if (event.target.value.length > 0)
          fetch(
            "https://www.googleapis.com/customsearch/v1?q=" +
              this.state.name +
              "&cx=015464166180940179903:65zdubuzn5a&fileType=jpg&imgColorType=gray&imgDominantColor=white&imgDominantColor=gray&imgDominantColor=black&imgType=clipart&searchType=image&key=AIzaSyAxCUKf2d2dIpFV0lnZ7VslvW4mqp9TQOU"
          )
            .then(res => res.json())
            .then(json => {
              console.log(json);
              if (json.items) {
                this.setState({
                  data: json.items.map(d => {
                    return {
                      img: d.image.thumbnailLink,
                      title: d.htmlTitle,
                      author: "author",
                      link: d.link
                    };
                  })
                });
                this.addImages(json.items.map(d => d.image.thumbnailLink));
              }
            });
      }, 1000)
    });
  };
  uploadImageSrc = (ev,i) => {
    if (!this.state.predicting) {

    let src = ev.target.src;
    fetch(src)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "dot.png", blob);
        this.props.history.push({
          pathname: "/result",
          state: {
            image: file,
            score: this.state.data[i].score
          }
        });
      });
    }
  };
  uploadImage = () => (event,i) => {
      console.log(event.target.files[0]);
      this.props.history.push({
        pathname: "/result",
        state: {
          image: event.target.files[0],
        }
      })
  };

  searchImage = name => event => {
    this.setState({
      name: event.target.value
    });
  };
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container>
          <Grid className="specialGrid" item xs={1} />{" "}
          <Grid className={classes.train} item xs={4}>
            <a href="/train"> ...Or help us train our model! </a>{" "}
          </Grid>{" "}
          <Grid item xs={10}>
            <Paper className={classes.paper}>
              <Grid item xs={12}>
                <img className={classes.title} src={logo} color="inherit" />
              </Grid>{" "}
              <Grid item xs={12}>
                <Typography
                  id="subheading"
                  variant="title"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  Making more tactile graphs available to blind people through
                  magic *
                </Typography>{" "}
              </Grid>
              <Grid container spacing={24}>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    className={classes.input}
                    style={{
                      display: "none"
                    }}
                    id="raised-button-file"
                    multiple
                    type="file"
                    onChange={this.uploadImage()}
                  />{" "}
                  <label htmlFor="raised-button-file">
                    <Button
                      id="uploadButton"
                      variant="contained"
                      color="primary"
                      className={classes.buttonSearch}
                      fullWidth={true}
                      component="span"
                    >
                      Upload your file{" "}
                    </Button>{" "}
                  </label>{" "}
                </Grid>{" "}
              </Grid>{" "}
              <Grid id="texthelper" item xs={12}>
                <TextField
                  id="outlined-name"
                  style={{
                    margin: 1
                  }}
                  disabled={this.state.predicting}
                  label="Or search for your image..."
                  className={classes.textField}
                  fullWidth
                  value={this.state.name}
                  onChange={e => this.handleChange(e)}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>{" "}
              <Grid item xs={12}>
                <ImageGrid
                  data={this.state.data}
                  uploadImage={this.uploadImageSrc}
                  addImage={this.addImage}
                  results={this.state.results}
                />
                <Typography
                  id="subheading"
                  variant="title"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  Examples of good images to upload{" "}
                </Typography>{" "}
              </Grid>{" "}
            </Paper>{" "}
          </Grid>{" "}
          <Grid className="specialGrid" item xs={1} />{" "}
        </Grid>{" "}
        <Footer />
      </div>
    );
  }
}
HomePage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withRouter(withStyles(styles)(HomePage));
