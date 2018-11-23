import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ReactSwing from 'react-swing';
import { CSSTransitionGroup } from 'react-transition-group' // ES6


import './TrainingPage.css';
import Footer from './TrainFooter';
import { withRouter } from 'react-router-dom';



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
    fontSize: "4rem",
    fontWeight: 300,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: "1.14286em",
    marginLeft: "-.04em",
    letterSpacing: "-.04em"
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
  allowedDirections:[ReactSwing.DIRECTION.RIGHT,ReactSwing.DIRECTION.LEFT],
  maximumRotation: 1,
  minThrowOutDistance: Infinity,
  maxThrowOutDistance: Infinity
};

class TrainingPage extends Component {
  stackEl = React.createRef();
  inputRef = React.createRef()
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    
  }
  state = {
    name: '',
    data: [],
    typing: false,
    typingTimeout: 0,
    stack: null,
    positives:[],
    negatives:[],
  };
  
  componentDidMount(){
    
    console.log(this)
    document.onkeydown = (e) => {
      console.log(e)
      console.log(this.state.data)
      if(this.state.data.length > 0){
        console.log(e)
        e = e || window.event;
          // stack.getCard
          console.log(document.getElementById("card_" + (this.state.data.length-1)))
          const card = this.state.stack.getCard(document.getElementById('card_' + (this.state.data.length-1) ));
          
          console.log('card', card);
          if (e.keyCode == '37') {
            // throwOut method call
            let positives = this.state.positives;
            positives.push(card)
            let newData = this.state.data;
            newData.pop();
            
            card.throwOut(-100, -200, ReactSwing.DIRECTION.LEFT);
            this.setState({
              positives,
              data: newData
            })
          }
          if (e.keyCode == '39') {
            let negatives = this.state.negatives;
            negatives.push(card)
            let newData = this.state.data;
            newData.pop();
            
            // throwOut method call
            card.throwOut(100, 200, ReactSwing.DIRECTION.RIGHT);
            this.setState({
              negatives,
              data: newData
            })
          }
      }
    }
  }
  
  
  // throwOut Method
  throwCard() {
    // ReactSwing Card Directions
    console.log('ReactSwing.DIRECTION', ReactSwing.DIRECTION);
    
    console.log('this.state.stack', this.state.stack);
    console.log('this.state.stack.getConfig', this.state.stack.getConfig());
    console.log('this.stackEl', this.stackEl);
    
    // ReactSwing Component Childrens
    const targetEl = this.stackEl.current.childElements[1];
    console.log('targetEl', targetEl);
    
    if (targetEl && targetEl.current) {
      // stack.getCard
      const card = this.state.stack.getCard(targetEl.current);
      
      console.log('card', card);
      
      // throwOut method call
      card.throwOut(100, 200, ReactSwing.DIRECTION.RIGHT);
    }
  }
  
  handleChange = event => {
    console.log(event.target)
    event.persist();
    if (this.state.typingTimeout) {
      clearTimeout(this.state.typingTimeout);
    }
    
    this.setState({
      name: event.target.value,
      typing: false,
      typingTimeout: setTimeout( () => {
        fetch("https://www.googleapis.com/customsearch/v1?q=" + this.state.name + "&cx=015464166180940179903%3A-60lix4pnzk&fileType=png%2Cjpg%2Cjpeg%2CJPG&imgColorType=gray&imgDominantColor=white&imgType=clipart&searchType=image&key=AIzaSyB4HH7P3KzLlaFjVbPszroBclnfA5awyzI")
        .then((res)=>res.json())
        .then((json)=>{
          console.log(this.inputRef)
          event.target.blur()
          console.log(json)
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
  handleThrow = (e) => {
    console.log(e)
    let dir = e.throwDirection;
    if (dir.toString().includes("LEFT")){
      let positives = this.state.positives;
      positives.push(e.target)
      this.setState({
        positives: positives
      })
    }
    else{
      let negatives = this.state.negatives;
      negatives.push(e.target)
      this.setState({
        negatives: negatives
      })
    }
  }
  
  
  searchImage = (name) => event => {
    this.setState({
      name: event.target.value,
    });
  };
  componentDidUpdate = (prevProps, prevState) =>{
    //data changed
    window.requestAnimationFrame(()=> {
      if(this.state.data != prevState.data){
        {this.state.data.map((d,i)=>{
          this.state.stack.createCard(document.getElementById('card_' + i));
        })}
      }
    })
  }
  unFocus = input => {
    if(this.state.data.length)
      input.blur();
  };
  render() {
    const { classes } = this.props;
    const cards = this.state.data.map((d,i  )=>{
      console.log(d)
        return (<div id={`card_${i}`} className="card clubs" ref="card1">
        <img className="imageNoDrag" src={d.img} alt={d.title} />
        </div>)
    })
    
    return (
      <div className={classes.root}>
      <Grid container >
      <Grid className="specialGrid" item xs={1}>
      </Grid>
      <Grid item xs={10}>
      <Paper className={classes.paper}>
      <Grid item xs={12}>
      <Typography className={classes.title} color="inherit" noWrap>
      Train the model!
      </Typography>
      </Grid>
      <Grid item xs={12}>
      <Typography id="subheading" variant="title" align="center" color="textSecondary" paragraph>
      Making more tactile graphs available to blind people through magic*
      </Typography>
      </Grid>
      
      <Grid id="texthelper" item xs={12}>
      <TextField
      id="outlined-name"
      style={{ margin: 1 }}
      label="Search for some images"
      className={classes.textField}
      fullWidth
      ref={this.inputRef}
      value={this.state.name}
      onChange={(ev) => this.handleChange(ev)}
      margin="normal"
      variant="outlined"
      />
      </Grid>
      <Grid item xs={12}>
      <div id="viewport">
      <ReactSwing
      className="stack"
      tagName="div"
      setStack={stack => this.setState({ stack })}
      ref={this.stackEl}
      config={config}
      throwout={e => this.handleThrow(e)}
      >
      {this.state.data.length ? cards : <div></div>}
      </ReactSwing>
      
      </div>
      
      <Typography id="subheading" variant="title" align="center" color="textSecondary" paragraph>
      Examples of good images to upload
      </Typography>
      
      </Grid>
      </Paper>
      </Grid>
      <Grid className="specialGrid" item xs={1}>
      </Grid>
      </Grid>
      <Footer/>
      </div>
      );
    }
  }
  TrainingPage.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
  export default withRouter(withStyles(styles)(TrainingPage));