import { ipcRenderer } from 'electron';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import logger from '../../utils/logger';

// import components here
import Header from '../components/Header';
import ConnectionPage from '../components/ConnectionPage';
import TopicPage from './TopicPage';
import Broker from './Broker';

import '../css/index.scss';
import '../css/App.scss';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: null,
      uriInput: 'localhost:9092',
      defaultURI: 'localhost:9092',
      topics: [],
      isFetching: false,
    };

    // bind methods here
    this.validConnectionChecker = this.validConnectionChecker.bind(this);
    this.updateURI = this.updateURI.bind(this);
    this.restartConnectionPage = this.restartConnectionPage.bind(this);
  }

  // Lifecycle methods
  componentDidMount() {
    // Listener will receive response from backend main process
    // If response is an error, display error to the user in connection page
    ipcRenderer.on('topic:getTopics', (e, data) => {
      this.setState({ isFetching: false });

      if (data.error) {
        logger.error('getTopics Error:', data);
        this.setState({
          connected: false,
        });
      } else {
        for (let i = 0; i < data.length; i++) {
          const topic = data[i];
          topic.showPartitions = false;
        }

        this.setState({
          topics: data,
          connected: true,
        });
      }
    });
  }

  // create function to setState connected to null
  restartConnectionPage() {
    this.setState({
      connected: false,
      uriInput: '',
      topics: [],
      isFetching: false,
    });
  }

  // This function is passed to the connection page to send the connection
  // url to the main process to connect to the Kafka cluster
  validConnectionChecker(event) {
    event.preventDefault();
    this.setState({
      isFetching: true,
    });

    const { uriInput, defaultURI } = this.state;

    if (!uriInput) {
      this.setState({ uriInput: defaultURI }, () => {
        ipcRenderer.send('topic:getTopics', uriInput);
      });
    } else {
      ipcRenderer.send('topic:getTopics', uriInput);
    }
  }

  // This function is passed to the connectionPage
  updateURI(event) {
    const { defaultURI } = this.state;
    const inputValue = event.target.value ? event.target.value : defaultURI;
    this.setState({ uriInput: inputValue });
  }

  render() {
    const { connected, isFetching, topics, uriInput, defaultURI } = this.state;

    return (
      <div className="main-div">
        {connected === true ? (
          <Router>
            <Header restartConnectionPage={this.restartConnectionPage} />
            <Switch>
              <Route
                path="/broker"
                render={() => <Broker brokersSnapshots={[]} kafkaHostURI={uriInput} />}
              />
              <Route
                path="/"
                render={() => (
                  <TopicPage uri={uriInput} topicList={topics} isConnected={connected} />
                )}
              />
              <Route path="/connectionpage" render={() => <ConnectionPage />} />
            </Switch>
          </Router>
        ) : (
          <ConnectionPage
            validConnectionChecker={this.validConnectionChecker}
            defaultURI={defaultURI}
            updateURI={this.updateURI}
            connected={connected}
            isFetching={isFetching}
          />
        )}
      </div>
    );
  }
}

export default Main;
