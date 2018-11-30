import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import firebase from "../../../firebase";

import Button from "@material-ui/core/Button";
import ReactSwing from "react-swing";
import { CSSTransitionGroup } from "react-transition-group"; // ES6
import { TFModel } from "../../../TFModelCopy";
import "./TrainingPage.css";
import Footer from "./TrainFooter";
import { withRouter } from "react-router-dom";
import Loading from "react-loading";
import { DataStorage } from "@tensorflow/tfjs";
import firebase2 from "firebase/app";

const firestore = firebase.firestore();

firestore.settings({
  timestampsInSnapshots: true
});

let colors = {
  green: "#008744",
  blue: "#0057e7",
  red: "#d62d20",
  yellow: "#ffa700",
  white: "#eee"
};

const dataRef = firestore.collection("Data");
const allRef = firestore.collection("All");
const queriesRef = firestore.collection("Queries");


const getBase64FromImageUrl = img => {
  var canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/jpg");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop: "0.5em"
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
    fontSize: "4rem",
    fontWeight: 300,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: "1.14286em",
    marginLeft: "-.04em",
    letterSpacing: "-.04em"
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
  }
});

const config = {
  /**
   * Invoked in the event of dragmove.
   * Returns a value between 0 and 1 indicating the completeness of the throw out condition.
   * Ration of the absolute distance from the original card position and element width.
   *
   * @param {number} xOffset Distance from the dragStart.
   * @param {number} yOffset Distance from the dragStart.
   * @param {HTMLElement} element Element.
   * @returns {number}
   */
  throwOutConfidence: (xOffset, yOffset, element) => {
    const xConfidence = Math.min(Math.abs(xOffset) / element.offsetWidth, 1);
    const yConfidence = Math.min(Math.abs(yOffset) / element.offsetHeight, 1);

    return Math.max(xConfidence, yConfidence);
  },
  allowedDirections: [ReactSwing.DIRECTION.RIGHT, ReactSwing.DIRECTION.LEFT],
  maximumRotation: 1,
  minThrowOutDistance: 500,
  maxThrowOutDistance: 500
};

class TrainingPage extends Component {
  stackEl = React.createRef();
  inputRef = React.createRef();
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  state = {
    name: "",
    data: [],
    typing: false,
    typingTimeout: 0,
    stack: null,
    positives: [],
    negatives: [],
    transformStyle: "",
    dissapearing: false,
    loadingModel: false,
    page: 0
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.data.length !== this.state.data.length) {
      if (this.state.data.length < 5) {
        //this.searchImages();
      }
    }
  }

  componentDidMount() {
    this.model = new TFModel();

    document.onkeydown = e => {
      if (this.state.data.length > 0 && !this.state.dissapearing) {
        e = e || window.event;
        // stack.getCard
        const card = this.state.stack.getCard(
          document.getElementById("card_" + (this.state.data.length - 1))
        );

        console.log("card", card);
        if (e.keyCode == "37") {
          card.throwOut(-1, 0);
        }
        if (e.keyCode == "39") {
          // throwOut method call
          card.throwOut(1, 0);
        }
      }
    };
  }

  searchImages = async (page = 1) => {
    let query = await queriesRef.doc(this.state.name).get()
    
    page = query.exists ? query.data().page : page;
    this.setState({
      page:page
    })
    let result = await fetch(
      "https://www.googleapis.com/customsearch/v1?q=" +
        this.state.name +
        "&cx=015464166180940179903%3A-60lix4pnzk&fileType=png%2Cjpg%2Cjpeg%2CJPG&imgColorType=gray&imgDominantColor=white&imgType=clipart&searchType=image&key=AIzaSyB4HH7P3KzLlaFjVbPszroBclnfA5awyzI&start=" +
        page
    );
    let json = await result.json();
    console.log(json);
    if (json.items) {
      let res = await allRef.doc("data").get();
      let newData;
      if (!res.exists) {
        newData = this.state.data.concat(
          json.items.map(d => {
            return {
              img: d.image.thumbnailLink,
              title: d.htmlTitle,
              author: "author"
            };
          })
        );
      } else {
        let data = json.items.filter(d => {
          let url = d.image.thumbnailLink.split("q=tbn:")[1];
          return !res.data().data.includes(url);
        });
        console.log(data);
        newData = this.state.data.concat(
          data.map(d => {
            return {
              img: d.image.thumbnailLink,
              title: d.htmlTitle,
              author: "author"
            };
          })
        );
      }
      this.setState({
        data: newData
      })
    }
  };

  handleChange = event => {
    console.log(event.target);
    event.persist();
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }

    this.setState({
      name: event.target.value,
      typing: false,
      typingTimeout: setTimeout(() => {
        this.searchImages();
      }, 1000)
    });
  };
  uploadImageSrc = ev => {
    let src = ev.target.src;
    fetch(src)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "dot.png", blob);
        this.props.history.push({
          pathname: "/result",
          state: { image: file }
        });
      });
  };
  handleThrow = async e => {
    this.setState({
      dissapearing: true
    });
    let dir = e.throwDirection;
    console.log(dir);
    let image = getBase64FromImageUrl(e.target.childNodes[1]);

    if (dir.toString().includes("LEFT")) {
      this.addToFirestore("negatives", image, e);
    } else {
      this.addToFirestore("positives", image, e);
    }
    this.addToFirestore("all", e.target.childNodes[1].src.split("q=tbn:")[1], e);
  };

  addToFirestore = async (direction, data) => {
    
    let ref = direction != "all" ? dataRef : allRef;
    let newData = direction != "all" ? {image:data, label: this.state.name, direction:direction}: firebase2.firestore.FieldValue.arrayUnion(data)
    if(direction != "all"){
      ref.doc().set(newData)  
    }
    else{
      ref.doc("data").update( {
        data: newData
      }).then(()=>{
      console.log("set!")
        this.setState({dissapearing: false});
    })
    .catch((err)=>{
      console.log(err.code)
      if(err.code == "not-found"){
        ref.doc("data").set({
          data:[data]
        })
        .then(()=>{
          this.setState({dissapearing:false})
        })
      }
    })
  };
}

  discard = e => {
    this.setState({dissapearing:true})

    console.log(e)
    // Remove swing eventlisteners from card
    this.state.stack.getCard(e.target).destroy();
    //Fade out card and remove it from DOM afterwards

    let xPos = e.target.style.transform.split(",")[2].split("(")[1];
    this.setState({
      transformStyle: "translate( " + xPos + ", 500px) !important;"
    });
    e.target.className += " dissapearing";

    setTimeout(() => {
      let newData = this.state.data;
      newData.pop();
      this.setState({
        dissapearing:false,
        data:newData
      },()=>{
        console.log(this.state.data.length)
        if(this.state.data.length < 3){
          let page = this.state.page + 10;
          queriesRef.doc(this.state.name).set({
            page: page
          })
          this.searchImages(page)
        }
      })

    }, 300);
  };

  componentDidUpdate = (prevProps, prevState) => {
    //data changed
    window.requestAnimationFrame(() => {
      if (this.state.data != prevState.data) {
        {
          this.state.data.map((d, i) => {
            this.state.stack.createCard(document.getElementById("card_" + i));
          });
        }
      }
    });
  };
  unFocus = input => {
    if (this.state.data.length) input.blur();
  };
  render() {
    const { classes } = this.props;
    const cards = this.state.data.map((d, i) => {
      return (
        <div key={i} id={`card_${i}`} className={`card clubs`} ref="card1">
          {this.state.transformStyle != "" ? (
            <style>
              {`
                .card.dissapearing {
                    transform: ${this.state.transformStyle} !important;
                    transition: transform 400ms ease-in !important;
                }
            `}
            </style>
          ) : (
            ""
          )}
          <img
            crossOrigin="Anonymous"
            className="imageNoDrag"
            src={d.img}
            alt={d.title}
          />
        </div>
      );
    });

    return (
      <div className={classes.root}>
        {this.state.loadingModel ? (
          <div className={classes.loaderContainer}>
            <Loading
              className={classes.loader}
              type={"spin"}
              color={colors["blue"]}
            />
          </div>
        ) : (
          ""
        )}

        <Grid container>
          <Grid className="specialGrid" item xs={1} />
          <Grid item xs={10}>
            <Paper className={classes.paper}>
              <Grid item xs={12}>
                <Typography className={classes.title} color="inherit" noWrap>
                  Train the model!
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  id="subheading"
                  variant="title"
                  align="center"
                  color="textSecondary"
                  paragraph
                >
                  Help us make more tactile graphs available
                </Typography>
              </Grid>

              <Grid id="texthelper" item xs={12}>
                <TextField
                  id="outlined-name"
                  style={{ margin: 1 }}
                  label="Search for some images to train the model"
                  className={classes.textField}
                  fullWidth
                  ref={this.inputRef}
                  value={this.state.name}
                  onChange={ev => this.handleChange(ev)}
                  margin="normal"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <div id="viewport">
                  <ReactSwing
                    className="stack"
                    setStack={stack => this.setState({ stack })}
                    ref={this.stackEl}
                    config={config}
                    throwout={e => this.handleThrow(e)}
                    throwoutend={e => this.discard(e)}
                  >
                    {this.state.data.length ? cards : <div />}
                  </ReactSwing>
                </div>
                <div className="tbContainer">
                  <div className="recsToolbar__tip Flxs(0) Fz($2xs) Fw($bold) Tt(u) Whs(nw) C($c-secondary) Trsdu($fast) Trsp($opacity) Mstart(12px)">
                    <svg
                      style={{ marginRight: "5px" }}
                      className="Sq(20px) Mend(4px)"
                      width="22px"
                      height="22px"
                      viewBox="0 0 22 22"
                    >
                      <g
                        fill="none"
                        fillRule="evenodd"
                        transform="translate(1 1) rotate(0 10 10)"
                      >
                        <path
                          fill="#b1b8c2"
                          d="M4.3884 10.409l1.2264.9845L7.4 12.8265l1.2265.9846c.491.3943.8926.208.8926-.4134v-1.908c.743-.106 3.5745-.444 4.1978-.5328.7422-.106 1.2895-.5682 1.2895-1.2625v-.003c0-.6944-.5473-1.1566-1.2895-1.2626-.6233-.0888-3.4547-.4268-4.1976-.533V5.988c0-.6216-.4016-.8075-.8925-.4136L7.4 6.5588c-.4908.394-1.2943 1.0388-1.7852 1.433l-1.2264.9843c-.491.3944-.491 1.039 0 1.433"
                        />
                        <rect
                          width="20"
                          height="20"
                          stroke="#b1b8c2"
                          strokeWidth="2.5"
                          rx="3"
                        />
                      </g>
                    </svg>
                    <span className="Va(m)">
                      <span>Bad Image </span>
                    </span>
                  </div>
                  <div className="recsToolbar__tip Flxs(0) Fz($2xs) Fw($bold) Tt(u) Whs(nw) C($c-secondary) Trsdu($fast) Trsp($opacity) Mstart(12px)">
                    <svg
                      style={{ marginRight: "5px" }}
                      className="Sq(20px) Mend(4px)"
                      width="22px"
                      height="22px"
                      viewBox="0 0 22 22"
                    >
                      <g
                        fill="none"
                        fillRule="evenodd"
                        transform="translate(1 1) rotate(180 10 10)"
                      >
                        <path
                          fill="#b1b8c2"
                          d="M4.3884 10.409l1.2264.9845L7.4 12.8265l1.2265.9846c.491.3943.8926.208.8926-.4134v-1.908c.743-.106 3.5745-.444 4.1978-.5328.7422-.106 1.2895-.5682 1.2895-1.2625v-.003c0-.6944-.5473-1.1566-1.2895-1.2626-.6233-.0888-3.4547-.4268-4.1976-.533V5.988c0-.6216-.4016-.8075-.8925-.4136L7.4 6.5588c-.4908.394-1.2943 1.0388-1.7852 1.433l-1.2264.9843c-.491.3944-.491 1.039 0 1.433"
                        />
                        <rect
                          width="20"
                          height="20"
                          stroke="#b1b8c2"
                          strokeWidth="2.5"
                          rx="3"
                        />
                      </g>
                    </svg>
                    <span className="Va(m)">
                      <span>Good Image</span>
                    </span>
                  </div>
                </div>
              </Grid>
            </Paper>
          </Grid>
          <Grid className="specialGrid" item xs={1} />
        </Grid>
        <Footer />
      </div>
    );
  }
}
TrainingPage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withRouter(withStyles(styles)(TrainingPage));
