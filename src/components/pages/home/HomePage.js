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
import logo from "../../../images/LogoSecondTaglineNoBG.png";
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
    lineHeight: "1.14286em",
    marginLeft: "-.04em",
    transform: "scale(0.9)",
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

function firstN(obj, n) {
  console.log(obj);
  let array = Object.keys(obj) //get the keys out
    .sort(function(a, b) {
      return parseFloat(obj[b]) - parseFloat(obj[a]);
    })
    .slice(0, n); //get the first N
  return array.map((a)=>{
    return{
      index: a,
      score:obj[a]
    }
  })
}

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

  setPredicting(bool) {
    this.setState({
      predicting: bool
    });
  }
  componentDidMount() {
    let data = sessionStorage.getItem("data");
    if (data !== null) {
      this.setState({
        data: JSON.parse(data),
        name: sessionStorage.getItem("query")
      });
    }
  }
  predictImages = async data => {
    //se cargaron todas las imagenes
    console.log("lala");
    if (this.state.name !== sessionStorage.getItem("query")) {
      console.log("finished");
      console.log("requesting...");
      let fetches = [];
      let chunk = 5;
      let results = {};
      for (let i = 0; i < data.length; i += chunk) {
        let subData = data.slice(i, i + chunk);
        let currentFetch = fetch(
          "https://openwhisk.ng.bluemix.net/api/v1/web/carlosegonzaleza%40hotmail.com_dev/default/classify.json",
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              images: subData.map(d => d.img)
            })
          }
        )
          .then(resp => resp.json())
          .then(json => {
            return new Promise((res, rej) => {
              if (json.results) {
                json.results.map((r, j) => {
                  results[i + j] = r.probability;
                });
                res(json.results);
              } else {
                rej("There has been an error on the request");
              }
            });
          });
        fetches.push(currentFetch);
      }
      Promise.all(fetches)
        .then(() => {
          let resultsSorted = firstN(results, 10);
          let newData = [];
          resultsSorted.map(res => {
            let d = data[res.index];
            d.score = res.score;
            newData.push(d);
          });
          console.log(newData)

          this.setState({
            predicting: false,
            data: newData
          });
          sessionStorage.setItem("data", JSON.stringify(newData));
          sessionStorage.setItem("query", this.state.name);
        })
        .catch(err => {
          this.setState({ predicting: false });
          alert(err);
        });
      //   fetch("https://openwhisk.ng.bluemix.net/api/v1/web/carlosegonzaleza%40hotmail.com_dev/default/classify.json", {
      //   method: "POST",
      //   headers: {
      //     Accept: "application/json",
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     images: this.state.data.map((d)=>d.img)
      //   })
      // })
      //   .then(resp => resp.json())
      //   .then(json => {
      //     console.log(json);
      //     let data = this.state.data;

      //     data.map((d, i) => {
      //       d.score =
      //         json.results[i] !== undefined ? json.results[i].probability : 0.0;
      //     });

      //     this.setState({
      //       data: data,
      //       predicting: false
      //     });
      //     sessionStorage.setItem("data", JSON.stringify(data));
      //     sessionStorage.setItem("query", this.state.name);
      //   });
    } else {
      this.setState({
        predicting: false
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
        if (event.target.value.length > 0) {
          this.setState({ predicting: true });
          let results = [];
          let fetches = [1, 11, 21, 31].map(start =>
            fetch(
              "https://www.googleapis.com/customsearch/v1?q=" +
                this.state.name +
                "&cx=015464166180940179903:65zdubuzn5a" +
                "&orTerms=simple&orTerms=clipart" +
                "&fileType=jpg&imgSize=medium" +
                "&imgColorType=gray&imgDominantColor=white&imgDominantColor=gray&imgDominantColor=black" +
                "&imgType=clipart&searchType=image" +
                "&key=AIzaSyAxCUKf2d2dIpFV0lnZ7VslvW4mqp9TQOU&start=" +
                start
            )
              .then(resp => resp.json())
              .then(res => {
                return new Promise((resolve, rej) => {
                  results = results.concat(res.items);
                  resolve(res);
                });
              })
          );
          Promise.all(fetches).then(res => {
            console.log(results);
            if (results.length > 0) {
              let newData = results.map(d => {
                return {
                  img: d.image.thumbnailLink,
                  title: d.htmlTitle,
                  author: "author",
                  link: d.link
                };
              });

              this.predictImages(newData);
            }
          });
        }
      }, 700)
    });
  };
  uploadImageSrc = (ev, i) => {
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
  uploadImage = () => (event, i) => {
    console.log(event.target.files[0]);
    this.props.history.push({
      pathname: "/result",
      state: {
        image: event.target.files[0]
      }
    });
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
                  results={this.state.results}
                  predicting={this.state.predicting}
                />
                <Typography
                  id="subheading"
                  variant="title"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  Good images for Tactile Graphics
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
