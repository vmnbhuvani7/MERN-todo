
import { ToastContainer } from 'react-toastify';
import MainRouter from './MainRouter';
import 'react-toastify/dist/ReactToastify.css';

import React, { Component } from "react";
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <>
        <ToastContainer />
        <MainRouter />
      </>
    )
  }
}

export default App

