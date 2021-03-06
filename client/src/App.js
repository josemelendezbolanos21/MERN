import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authActions';
import { clearCurrentProfile } from './actions/profileActions';
import store from './store';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashborad from './components/dashboard/Dashboard';
import PrivateRoute from './components/common/PrivateRoute';

import './App.css';
import CreateProfile from './components/create-profile/CreateProfile';

// Check for token
if (localStorage.jwtToken) {
  // Set auth token header auth
  setAuthToken(localStorage.jwtToken);
  // Decode token and get user info and exp
  const decoded = jwt_decode(localStorage.jwtToken);
  // Set current user and isAuthenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expire token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // Logout user 
    store.dispatch(logoutUser());
    // TODO: clear current profile
    store.dispatch(clearCurrentProfile());
    // Redirect to login
    window.location.href = '/login';
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={ store } >
        <Router>
          <div className='App'>
            <Navbar />
            <Route exact path='/' component={ Landing } />
            <div className='container'>
              <Route exact path='/login' component={ Login } />
              <Route exact path='/register' component={ Register } />
              <Switch>
                <PrivateRoute exact path='/dashboard' component={ Dashborad } />
              </Switch>
              <Switch>
                <PrivateRoute exact path='/create-profile' component={ CreateProfile } />
              </Switch>
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
