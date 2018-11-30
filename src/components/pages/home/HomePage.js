import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import tileData from './tileData';

import './HomePage.css';
import Footer from '../../shared/HomeFooter';
import { withRouter } from 'react-router-dom';
import ImageGrid from './ImageGrid'

const styles = theme => ({
  root: {
    flexGrow: 1,
    marginTop:"2.5em"
  },
  button: {
    padding: theme.spacing.unit * 1,
    textAlign: 'center',
  },
   buttonSearch: {
    padding: theme.spacing.unit * 1.25,
    textAlign: 'center',
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
   textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  title: {
    fontSize: "6rem",
    fontWeight: 300,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: "1.14286em",
    marginLeft: "-.04em",
    letterSpacing: "-.04em"
  },
  train:{
    right:"10vw",     
    position: "absolute"
  }
});


class HomePage extends Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
 }
state = {
    name: '',
    data: tileData,
    typing: false,
    typingTimeout: 0
  };

handleChange = event => {
  console.log(event.target)
    if (this.state.typingTimeout) {
       clearTimeout(this.state.typingTimeout);
    }
    
    this.setState({
       name: event.target.value,
       typing: false,
       typingTimeout: setTimeout( () => {
        fetch("https://www.googleapis.com/customsearch/v1/siterestrict?q=" + this.state.name + "&cx=015464166180940179903%3A-60lix4pnzk&fileType=png%2Cjpg%2Cjpeg%2CJPG&imgColorType=gray&imgDominantColor=white&imgType=clipart&searchType=image&key=AIzaSyB4HH7P3KzLlaFjVbPszroBclnfA5awyzI")
        .then((res)=>res.json())
        .then((json)=>{
          this.setState({
            data: json.items.map((d)=>{
              return {
                img:d.image.thumbnailLink,
                title:d.htmlTitle,
                author:"author"
              }
            })
          })
        })
      }, 1000)
    }); 
  };
uploadImageSrc = (ev) => {
  let src = ev.target.src;
  fetch(src)
  .then(res => res.blob())
  .then(blob => {
  const file = new File([blob], 'dot.png', blob)
  this.props.history.push({
      pathname: '/result',
      state: { image: file }
    })
  })
};
uploadImage = () => event => {
    console.log(event.target.files[0])
    this.props.history.push({
  pathname: '/result',
  state: { image: event.target.files[0]  }
})
  };

searchImage = (name) => event => {
    this.setState({
      name: event.target.value,
    });
  };
  render() {
    const { classes } = this.props;
    return (
    <div className={classes.root}>
      <Grid container >
      <Grid className="specialGrid" item xs={1}>
       </Grid>
       <Grid className={classes.train} item xs={4}>
            <a href="/train">...Or help us train our model!</a>
          </Grid>
        <Grid item xs={10}>
          
          <Paper className={classes.paper}>
          <Grid item xs={12}>
            <Typography className={classes.title} color="inherit" noWrap>
            Tactiled
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography id="subheading" variant="title" align="center" color="textSecondary" paragraph>
              Making more tactile graphs available to blind people through magic*
            </Typography>
          </Grid>

          
          <Grid container spacing={24}>
            <Grid item xs={12}>
            <input
              accept="image/*"
              className={classes.input}
              style={{ display: 'none' }}
              id="raised-button-file"
              multiple
              type="file"
              onChange={this.uploadImage()}
              />
            <label htmlFor="raised-button-file">
              <Button id="uploadButton" variant="contained" 
              color="primary" 
              className={classes.buttonSearch} 
              fullWidth={true} component="span" >
              Upload your file
           </Button>
          </label> 
          
          </Grid>
        </Grid>
        <Grid id="texthelper" item xs={12}>
          <TextField
          id="outlined-name"
          style={{ margin: 1 }}
          label="Or search for your image..."
          className={classes.textField}
          fullWidth
          value={this.state.name}
          onChange={(ev) => this.handleChange(ev)}
          margin="normal"
          variant="outlined"
          />
          </Grid>
          <Grid item xs={12}>
            <ImageGrid data={this.state.data} uploadImage={this.uploadImageSrc}/>

            <Typography id="subheading" variant="title" align="center" color="textSecondary" paragraph>
              Examples of good images to upload
            </Typography>

          </Grid>
          </Paper>
        </Grid>
        <Grid className="specialGrid" item xs={1}>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
  }
}
HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(HomePage));