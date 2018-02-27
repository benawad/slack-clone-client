import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import decode from 'jwt-decode';
import Loadable from 'react-loadable';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    decode(token);
    const { exp } = decode(refreshToken);
    if (Date.now() / 1000 > exp) {
      return false;
    }
  } catch (err) {
    return false;
  }

  return true;
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      (isAuthenticated() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
          }}
        />
      ))
    }
  />
);

const Loading = () => <div>...loading</div>;

const AsyncHome = Loadable({
  loader: () => import('./Home'),
  loading: Loading,
});
const AsyncRegister = Loadable({
  loader: () => import('./Register'),
  loading: Loading,
});
const AsyncLogin = Loadable({
  loader: () => import('./Login'),
  loading: Loading,
});
const AsyncViewTeam = Loadable({
  loader: () => import('./ViewTeam'),
  loading: Loading,
});
const AsyncCreateTeam = Loadable({
  loader: () => import('./CreateTeam'),
  loading: Loading,
});

export default () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact component={AsyncHome} />
      <Route path="/register" exact component={AsyncRegister} />
      <Route path="/login" exact component={AsyncLogin} />
      <PrivateRoute path="/view-team/:teamId?/:channelId?" exact component={AsyncViewTeam} />
      <PrivateRoute path="/create-team" exact component={AsyncCreateTeam} />
    </Switch>
  </BrowserRouter>
);
