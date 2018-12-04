import React, { Component } from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import imageEx from "../../../images/elephantExample.png";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Footer from "../../shared/Footer";
import TextField from "@material-ui/core/TextField";
import "./EvaluationResultPage.css";
import Loading from "react-loading";
import MenuItem from "@material-ui/core/MenuItem";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import NavBar from "../../shared/NavBar";
import Select from "@material-ui/core/Select";
import firebase from "../../../firebase";
import { TableBody } from "@material-ui/core";

const firestore = firebase.firestore();

firestore.settings({
  timestampsInSnapshots: true
});

const dataRef = firestore.collection("Data");

const getBase64FromImageUrl = img => {
  var canvas = document.createElement("canvas");
  canvas.width = 224;
  canvas.height = 224;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/jpg");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};


let colors = {
  green: "#008744",
  blue: "#0057e7",
  red: "#d62d20",
  yellow: "#ffa700",
  white: "#eee"
};
const styles = theme => ({
  contentcontainer: {
    flexGrow: 1,
    padding: "30px 30px",
    marginBottom: "1.7em"
  },
  container: {
    position: "absolute",

    top: "50%",
    transform: "translate(0,-50%)"
  },
  title: {
    marginTop: "10px",
    padding: "10px 5px"
  },
  results: {
    marginTop: "10px",
    padding: "10px 5px",
    "font-size": "3.5em"
  },
  buttonCase: {
    padding: "10px 5px",
    marginLeft: 15
  },
  button: {
    marginTop: "4px",
    padding: ".8em 1em",
    cursor: "pointer"
  },
  rangeresult: {
    width: "80%"
  },
  inputbutton: {
    padding: "15px 14px",
    marginTop: 5
  },
  leftcontainer: {
    width: "100%",
    "max-width": "100%"
  },
  inputFile: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    display: "none"
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

class EvaluationResultPage extends Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.image = React.createRef();

    let history = this.props.history.location.state;
    var urlCreator = window.URL || window.webkitURL;
    console.log(history);
    this.state = {
      accepted: true,
      showClassify: false,
      value: history.score,
      category: history.score >= 50 ? "Positive" : "Negative",
      image:
        history && history.image
          ? urlCreator.createObjectURL(history.image)
          : imageEx,
      loadingImg: false,
      name:"",
      showLoader: false,
    };
    this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
    // this.getImageScore = this.getImageScore.bind(this);
    this.model = null;
  }

  // componentDidUpdate(prevProps, prevState) {
  //   let startingPredict = !prevState.predicting && this.state.predicting;
  //   let startingLoad = !prevState.loadingImg && this.state.loadingImg;
  //   if (startingPredict || startingLoad) {
  //     this.setState({ showLoader: false });
  //     setTimeout(() => {
  //       this.setState({ showLoader: true });
  //     }, 200);
  //   }
  // }
  async componentDidMount() {
    console.log(this.props.history.location.state)

    // this.model = new TFModel();
    // console.time("Loading of model");
    // await this.model.load();
    // console.timeEnd("Loading of model");
    // this.getImageScore();
  }
  // async getImageScore() {
  //   this.setState({ predicting: true });
  //   let inputImage = document.getElementById("inputImage").cloneNode();
  //   console.log(inputImage);

  //   console.time("First prediction");
  //   let result = this.model.predict(inputImage);
  //   console.log(result);
  //   const prediction = await this.model.getTopKClasses(result);
  //   console.timeEnd("First prediction");
  //   console.log(prediction);
  //   let predValue = prediction.find(p => p.label == "positive").value * 100;
  //   this.setState({
  //     value: Math.round(predValue * 100) / 100,
  //     predicting: false,
  //     showLoader: false,
  //     predictions: this.state.predictions + 1
  //   });
  // }

  fileSelectedHandler(event) {
    console.log(event);
    if (event.target.files && event.target.files[0]) {
      console.log(event.target.files[0]);
      let reader = new FileReader();
      reader.onload = e => {
        console.log("loadedddd");
        this.setState({ image: e.target.result, loadingImg: false });
      };
      reader.readAsDataURL(event.target.files[0]);
    } else {
      this.setState({ loadingImg: false });
    }
  }
  handleImgLoad() {
    console.log("entro aca")
    let history = this.props.history.location.state;
    if((!history || !history.image) && !history.score){
      this.setState({showLoader:true})
      let buffer = getBase64FromImageUrl(document.getElementById("inputImage"))
      fetch("https://tactiled.firebaseapp.com/api/predictMultiple", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          data: [buffer]
        })
      })
        .then(resp => resp.json())
        .then(json => {
          this.setState({
            showLoader:false,
            value: json.data[0].probability
            })
          console.log(json);

        })
    }
  }
  handleUploadClick() {
    this.setState({ loadingImg: true });
    document.body.onfocus = () => {
      let input = document.getElementById("file-upload");
      if (input == null || this.state.inputImage == input.value || input.value.length == 0) {
        this.setState({ loadingImg: false });
      }
    };
    this.inputRef.current.click();
  }
  renderResultTitle() {
    const { classes } = this.props;

    return this.state.accepted ? (
      <Typography
        className={classes.results}
        component="h1"
        variant="display2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        Accepted
      </Typography>
    ) : (
      <Typography
        className={classes.results}
        component="h1"
        variant="display2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        Failed
      </Typography>
    );
  }

  renderImageResults() {
    const { classes } = this.props;

    return this.state.value >= 85 ? (
      <Typography
        className={classes.title}
        component="h1"
        variant="display2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        Great image! It works!
      </Typography>
    ) : this.state.predictions ? (
      <Typography
        className={classes.title}
        component="h2"
        variant="display2"
        align="center"
        color="textPrimary"
        gutterBottom
      >
        Try again with a better image :(
      </Typography>
    ) : (
      ""
    );
  }

  handleDownload(){
    var url = document.getElementById("inputImage").src.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
    window.open(url);
  }
  getInitialState(event) {
    this.setState({ value: event.target.value });
  }

  handleChange = name => event => {
    this.setState({
      name: event.target.value
    });
  };
  sendFeedBack = () => {
    let img = getBase64FromImageUrl(document.getElementById("inputImage"));
    let data = { image: img, label: this.state.name, direction: this.state.category }

    dataRef.doc().set(data)
    .then(()=>{
      alert("Feedback sent!")
    })
  }

  render() {
    const { classes } = this.props;
    // balls
    // bars
    // bubbles
    // cubes
    // cylon
    // spin
    // spinningBubbles
    // spokes
    return (
      <div>
        {this.state.showLoader ? (
          <div className={classes.loaderContainer}>
            <Loading
              className={classes.loader}
              type={"spinningBubbles"}
              color={colors["blue"]}
            />
            {this.state.predicting && (
              <h3 className={classes.loaderText}>
                Loading Maching Learning Model... please have patience
              </h3>
            )}
          </div>
        ) : (
          ""
        )}
        <NavBar history={this.props.history} />
        <Grid container className={classes.container}>
          <Grid item xs={12} sm={6}>
            {this.renderResultTitle()}
            <Grid
              container={true}
              justify="center"
              alignContent="center"
              className={classes.contentcontainer}
            >
              <img
                id="inputImage"
                ref={this.image}
                className={classes.img}
                src={this.state.image}
                alt="dogImage"
                onLoad={() => this.handleImgLoad()}
              />
              <Grid
                container={true}
                justify="center"
                item
                xs={12}
                sm={12}
                className={classes.buttonCase}
              >
                <Button
                  variant="outlined"
                  disabled={
                    this.state.loadingImg ||
                    this.state.predicting
                  }
                  onClick={() => {
                    this.handleUploadClick();
                  }}
                  color="default"
                  className={classes.button}
                >
                  Upload another image
                  <input
                    ref={this.inputRef}
                    id="file-upload"
                    accept="image/*"
                    onChange={event => this.fileSelectedHandler(event)}
                    className={classes.inputFile}
                    type="file"
                  />
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={()=> this.handleDownload()}
                  className={classes.button}
                >
                  Download the image
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid
            container={true}
            justify="center"
            alignContent="center"
            className={classes.contentcontainer}
            item
            xs={12}
            sm={6}
          >
            <div className="val">Score: {this.state.value}</div>
            <input
              className={classes.rangeresult}
              id="typeinp"
              type="range"
              min="0"
              max="100"
              value={this.state.value}
              onChange={this.getInitialState.bind(this)}
              step="0.01"
              disabled
            />
            {this.renderImageResults()}
            <Grid
              container={true}
              justify="center"
              alignContent="center"
              className={classes.leftcontainer}
              xs={12}
              sm={12}
            >
              <Button
                variant="outlined"
                color="blue"
                className={classes.inputbutton}
                onClick={() =>
                  this.setState({ showClassify: !this.state.showClassify })
                }
              >
                {!this.state.showClassify
                  ? "Doesn't make sense? Reclassify the image!"
                  : "Hide Classifier"}
              </Button>
            </Grid>
            {this.state.showClassify && (
              <Grid
                container={true}
                justify="center"
                alignContent="center"
                className={classes.leftcontainer}
                xs={12}
                sm={12}
              >
                <Grid
                  container={true}
                  justify="center"
                  alignContent="center"
                  item
                  xs={12}
                  sm={3}
                >
                  <FormControl
                    variant="outlined"
                    className={classes.formControl}
                  >
                    <InputLabel
                      ref={ref => {
                        this.InputLabelRef = ref;
                      }}
                      htmlFor="outlined-age-simple"
                    >
                      Quality
                    </InputLabel>
                    <Select
                      value={this.state.category}
                      onChange={e => {
                        this.setState({
                          category:
                            this.state.category == "Positive"
                              ? "Negative"
                              : "Positive"
                        });
                      }}
                      input={
                        <OutlinedInput
                          labelWidth={this.state.labelWidth}
                          name="age"
                          id="outlined-age-simple"
                        />
                      }
                    >
                      <MenuItem value={"Positive"}>Good</MenuItem>
                      <MenuItem value={"Negative"}>Bad</MenuItem>
                    </Select>
                    <Button
                      variant="outlined"
                      color="primary"
                      className={classes.button}
                      onClick={() => this.sendFeedBack()}
                      disabled={this.state.name.length == 0}
                      
                    >
                      Send Feedback
                    </Button>
                  </FormControl>
                </Grid>
                <Grid
                  container={true}
                  justify="center"
                  alignContent="center"
                  item
                  xs={12}
                  sm={9}
                >
                  <TextField
                    style={{ margin: 1 }}
                    label="Add identifying labels describing the photo!"
                    className={classes.textField}
                    fullWidth
                    value={this.state.name}
                    onChange={this.handleChange("Search for your image")}
                    margin="normal"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Footer />
      </div>
    );
  }
}

EvaluationResultPage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(EvaluationResultPage);
