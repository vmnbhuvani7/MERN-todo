import React from 'react';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Dashboard from './page/Dashboard';
import Login from './page/Login';
import ForgotPassword from './page/ForgotPassword';
import PrivetRouter from './PrivetRouter';

const MainRouter = () => {
    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={Login} />
                    <Route exact path="/forgotpassword" component={ForgotPassword} />
                    <PrivetRouter exact path="/dashboard" component={Dashboard} />
                </Switch>
            </BrowserRouter>
        </div>
    )
}

export default MainRouter
