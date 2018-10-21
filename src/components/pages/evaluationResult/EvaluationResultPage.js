import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import imageEx from '../../../images/dogExample.jpg';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Footer from '../../shared/Footer';
import TextField from '@material-ui/core/TextField';
import './EvaluationResultPage.css';

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
  	padding: '.8em 1em'
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
  }
});

class EvaluationResultPage extends Component {
	state = {
    accepted: true,
    value: 0
};

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

		return (
			<div>
				<Grid container>


					<Grid item xs={12} sm={6}>
						{this.renderResultTitle()}
						<Grid container={true} justify='center' alignContent='center' className={classes.contentcontainer} >
          				<img id="exampleImage" src={imageEx} alt="dogImage" />
          				<Grid container={true} justify='center' item xs={12} sm={12} className={classes.buttonCase}>
          				<Button variant="outlined" color="default" className={classes.button}>
          					Upload another image
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
          				step="1"
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
