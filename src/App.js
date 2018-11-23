import React, { Component } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import HomePage from './components/pages/home/HomePage';
import ResultPage from './components/pages/evaluationResult/EvaluationResultPage';
import SearchResultsPage from './components/pages/searchResults/SearchResultsPage';
import TrainingPage from "./components/pages/training/TrainingPage";
import NotFound from './components/shared/NotFoundPage';
import './App.css';

class App extends Component {
  render() {
    return (
   <Router>
    <div>
      <Switch>
      	<Route exact path="/" component={HomePage} />
      	<Route exact path="/result" component={ResultPage} />
      	<Route exact path="/resultspage" component={SearchResultsPage} />
        <Route exact path="/train" component={TrainingPage}/>
      	<Route component={NotFound} />
      </Switch>
    </div>
  </Router>
    );
  }
}

export default App;
