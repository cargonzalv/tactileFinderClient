import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Footer from '../../shared/Footer';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import Typography from '@material-ui/core/Typography';
import tileData from './tileData';

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop:"30px",
    'font-size':'5em',
    marginLeft:'30px'
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  gridList: {
    width: '100%',
    height: '80%',
    padding:'20 20'
  }, images: {
    width:"200px",
    height: 180,
  },titleBar: {
   
  },
  imageContainer:{
    minWidth: 150,
    width: "50vw",
    maxWidth: '33%',
   'align-items':'center'
  },
  centering:{
  	'justify-content': 'center',
  	'display': 'flex',
  	'flex-wrap': 'wrap'
   
  }
});

class SearchResultsPage extends Component {
	state = {
    accepted: true,
    value: 0
};

	getInitialState(event) {
		this.setState( {value: event.target.value});
	}


	render() {
		const { classes } = this.props;
		return (
			<div>
				<Grid container justify='center' alignContent='center'>
					<Typography className={classes.root} component="h1" variant="display2" align="left" color="textPrimary" gutterBottom>
						Image results
					</Typography>
					<div className={classes.grid}>
						<GridList cellHeight={250} className={classes.gridList}>
							{tileData.map(tile => (
								
          						<GridListTile className={classes.imageContainer} key={tile.img}>
          						<div className={classes.centering}>
            					<img className={classes.images} src={tile.img} alt={tile.title} />
            					</div>
            					<div className={classes.centering}>
            					<Typography className={classes.caption} variant="caption" align="left" color="textPrimary" gutterBottom>
          							{tile.title}
          						</Typography>
          						</div>
            					<div className={classes.centering}>
            					<input 
          							className={classes.rangeresult}
          							id="typeinp" 
          							type="range" 
          							min="0" max="100" 
          							value={this.state.value} 
          							onChange={this.getInitialState.bind(this)}
          							step="1"
          							/>

          						</div>
          						</GridListTile>

          						
          						
       		 				))}
     	 				</GridList>
     	 			</div>

					<Footer />
				</Grid>
			</div>
		);
	}
}

SearchResultsPage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SearchResultsPage);
