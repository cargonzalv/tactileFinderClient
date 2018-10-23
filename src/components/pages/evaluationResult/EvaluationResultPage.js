import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import imageEx from '../../../images/elephantExample.png';
import loaderGif from "../../../images/loader.gif";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Footer from '../../shared/Footer';
import TextField from '@material-ui/core/TextField';
import './EvaluationResultPage.css';
import {TFModel} from "../../../TFModel.js";
import Loading from 'react-loading';
import { TableBody } from '@material-ui/core';

let colors = {
	"green" : "#008744",
	"blue"  : "#0057e7",
	"red"   : "#d62d20",
	"yellow": "#ffa700",
	"white" : "#eee",
}
const styles = theme => ({
  contentcontainer: {
    flexGrow: 1,
    padding: '30px 30px',
    marginBottom:'1.7em'
  },
  title: {
  	marginTop: '10px',
  	padding: '10px 5px',
  	
  },
  results: {
  	marginTop: '10px',
  	padding: '10px 5px',
  	'font-size':'3.5em'
  	
  },
  buttonCase: {
  	padding: '10px 5px',
  	marginLeft: 15
  },
  button: {
  	marginTop:'4px',
	padding: '.8em 1em',
	cursor:"pointer"
  },
  rangeresult:{
  	width:'80%'
  },
  inputbutton: {
  	padding: '15px 14px',
  	marginTop:5
    
  },
  leftcontainer:{
  	width:'100%',
  	'max-width':'100%'
  },
  loaderContainer:{
	position: "fixed", /* Sit on top of the page content */
    display: "block", /* Hidden by default */
    width: "100%", /* Full width (cover the whole page) */
    height: "100%", /* Full height (cover the whole page) */
    top: 0, 
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", /* Black background with opacity */
    zIndex: 1000,/* Specify a stack order in case you're using a different order for other  */
  },
  loader:{
	position: "relative", /* Sit on top of the page content */
    width: "200px", /* Full width (cover the whole page) */
    height: "200px", 
    top: "40%", 
    left: "50%",
	transform: "translate(-50%,-50%)",
  },
  inputFile:{
	width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
	left: 0,
	display:"none"
  }
});

class EvaluationResultPage extends Component {
	constructor(props){
		super(props);
		this.inputRef = React.createRef();
		this.image = React.createRef();
		this.state = {
			accepted: true,
			value: 0,
			image : imageEx,
			predicting: false,
			loadingImg: false,
			predictions: 0,
			showLoader: false,
			changeTimeout : 0
		};
		this.fileSelectedHandler = this.fileSelectedHandler.bind(this);
		this.getImageScore = this.getImageScore.bind(this);
		this.model = null;
	}
	
	componentDidUpdate(prevProps, prevState){
		let startingPredict = !prevState.predicting && this.state.predicting;
		let startingLoad = !prevState.loadingImg && this.state.loadingImg;
		if(startingPredict||startingLoad){
			this.setState({showLoader: false})
			setTimeout(()=>{
				this.setState({showLoader:true})
			},200)
		}
	}
	async componentDidMount(){
		this.model = new TFModel();
		console.time('Loading of model');
		await this.model.load();
  		console.timeEnd('Loading of model');
		this.getImageScore();
	}
	async getImageScore(){
		this.setState({predicting: true})
		let inputImage = document.getElementById("inputImage").cloneNode()
		console.log(inputImage)

		console.time('First prediction');
		  let result = this.model.predict(inputImage);
		  console.log(result)
		const prediction = await this.model.getTopKClasses(result);
		console.timeEnd('First prediction');
		console.log(prediction)
		let predValue = prediction.find((p)=>p.label == "positive").value*100;
		this.setState({
			value: Math.round(predValue * 100)/100,
			predicting: false,
			predictions: this.state.predictions + 1
		})
	
	}

	fileSelectedHandler(event){
		console.log(event)
		if (event.target.files && event.target.files[0]) {
			console.log(event.target.files[0])
            let reader = new FileReader();
            reader.onload = (e) => {
				console.log("loadedddd")
				this.setState({image: e.target.result, loadingImg:false})
        	}
			reader.readAsDataURL(event.target.files[0]);
		}	
		else{
			this.setState({loadingImg:false})
		}
	}
	handleImgLoad(){
		if(this.state.predictions) {
			this.getImageScore()
		}
	}
	handleUploadClick(){
		this.setState({loadingImg:true});
		document.body.onfocus = ()=>{
			let input = document.getElementById("file-upload");
			if(this.state.inputImage == input.value || input.value.length == 0){
				this.setState({loadingImg:false})
			}
		};
		this.inputRef.current.click()
	}
	renderResultTitle() {
		const { classes } = this.props;

		return this.state.accepted?<Typography className={classes.results} component="h1" variant="display2" align="center" color="textPrimary" gutterBottom>
						Accepted
						</Typography>:<Typography className={classes.results} component="h1" variant="display2" align="center" color="textPrimary" gutterBottom>
						Failed
						</Typography>;
	}

	renderImageResults() {
		const { classes } = this.props;

		return this.state.value>=85?<Typography className={classes.title} component="h1" variant="display2" align="center" color="textPrimary" gutterBottom>
						Great image! It works!
						</Typography>:<Typography className={classes.title} component="h1" variant="display2" align="center" color="textPrimary" gutterBottom>
						Try again with a better image :(
						</Typography>;
	}

	getInitialState(event) {
		this.setState( {value: event.target.value});
	}

	handleChange = (name) => event => {
    this.setState({
      name: event.target.value,
    });
  };

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
				{(this.state.predicting || this.state.loadingImg) && this.state.showLoader ?
				<div className={classes.loaderContainer}>
					<Loading className={classes.loader} type={"spin"} color={colors["blue"]}/>
				</div>:""}
				<Grid container>

					<Grid item xs={12} sm={6}>
						{this.renderResultTitle()}
						<Grid container={true} justify='center' alignContent='center' className={classes.contentcontainer} >
          				<img id="inputImage" ref={this.image} className={classes.img} src={this.state.image} alt="dogImage" onLoad={()=> this.handleImgLoad()} />
          				<Grid container={true} justify='center' item xs={12} sm={12} className={classes.buttonCase}>
          				<Button  variant="outlined" disabled={this.state.loadingImg || this.state.predicting || !this.state.predictions} onClick={()=>{this.handleUploadClick()}} color="default" className={classes.button}>
          						Upload another image
								<input ref={this.inputRef} id="file-upload" accept="image/*" onChange={(event)=>this.fileSelectedHandler(event)} className={classes.inputFile} type="file"></input>
          					</Button>
          				<Button variant="outlined" color="primary" className={classes.button}>
          					Download the t-graph
          				</Button>
          				</Grid>
          				</Grid>
        			</Grid>

						<Grid container={true} justify='center' alignContent='center' className={classes.contentcontainer} item xs={12} sm={6}>
          				<div className="val">Score: {this.state.value}</div>
          				<input 
          				className={classes.rangeresult}
          				id="typeinp" 
          				type="range" 
          				min="0" max="100" 
          				value={this.state.value} 
          				onChange={this.getInitialState.bind(this)}
          				step="0.01"
          				/>
          				{this.renderImageResults()}
          				<Grid container={true} justify='center' alignContent='center' className={classes.leftcontainer}  xs={12} sm={12}>
        					<Grid container={true} justify='center' alignContent='center'  item xs={12} sm={3}>
        						<Button variant="outlined" color="default" className={classes.inputbutton}>
          							Add the label!
          						</Button>
          					</Grid>
          					<Grid container={true} justify='center' alignContent='center'  item xs={12} sm={9}>
        						<TextField
        						style={{ margin: 1 }}
        						label="Add identifying labels to help!"
        						className={classes.textField}
        						fullWidth
        						value={this.state.name}
        						onChange={this.handleChange('Search for your image')}
        						margin="normal"
        						variant="outlined"
        						/>
        					</Grid>
        				</Grid>
					</Grid>
        			<Footer />
				</Grid>      		
			</div>
		);
	}
}

EvaluationResultPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EvaluationResultPage);
