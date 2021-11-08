import React, { Component } from "react";
import ChatContract from "./contracts/Chat.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { messages: [], message: '', loading: true, loggedIn: '' };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      this.accounts = await web3.eth.getAccounts();

      this.setState({loggedIn: this.accounts[0]})

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      this.chatInstance = new web3.eth.Contract(
        ChatContract.abi,
        ChatContract.networks[networkId] && ChatContract.networks[networkId].address,
      );

      let messageCount = await this.chatInstance.methods.messageCount().call()

      if (messageCount >= 1) {
        for (let i = 0; i < messageCount; i++) {
          let message = await this.chatInstance.methods.messages(i).call();

          message.timestamp = new Date(message.timestamp * 1000);
          message.timestamp = `${message.timestamp.getDate()}.${message.timestamp.getMonth()+1}.${message.timestamp.getFullYear()} ${message.timestamp.getHours()}:${message.timestamp.getMinutes()}`

          this.setState({messages: [...this.state.messages, message]});
        }
      }
      
      this.listenToNewMessages();

      this.setState({ loading: false });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3 or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  listenToNewMessages = () => {
    this.chatInstance.events.newMessage().on('data', async(evt) => {
      evt.returnValues.timestamp = new Date(evt.returnValues.timestamp * 1000);
      evt.returnValues.timestamp = `${evt.returnValues.timestamp.getDate()}.${evt.returnValues.timestamp.getMonth()+1}.${evt.returnValues.timestamp.getFullYear()} ${evt.returnValues.timestamp.getHours()}:${evt.returnValues.timestamp.getMinutes()}`
      this.setState({messages: [...this.state.messages, {fromAddress: evt.returnValues.fromAddress, message: evt.returnValues.message, timestamp: evt.returnValues.timestamp}]})
    })
  }

  handleLogin = () => {

  }

  handleSubmit = () => {
    let {message} = this.state;

    if (message) {
      this.chatInstance.methods.addMessage(message).send({from: this.accounts[0]});
      this.setState({message: ''})
    }
  }

  render() {
    if (this.state.loading) {
      return <div>Loading...</div>;
    }
    return (
      <div className="App" style={{height: '100vh'}}>
        <h1>Welcome to the Blockchain Chat!</h1>
        {!this.state.loggedIn && (
          <div className="button" onClick={this.handleLogin}>Login with MetaMask</div>
        )}
        <div style={{maxWidth: 900, margin: '0 auto', border: '1px solid #333', borderRadius: '10px', height: '80%'}} className="chat">
          <div className="chat-messages">
            {this.state.messages.map((m,i) => {
              return (<div className={m.fromAddress == this.state.loggedIn ? 'message sender' : 'message'} key={'m'+i}>
                <div className="message-info">{m.fromAddress} at {m.timestamp}</div>
                <div className="message-content">{m.message}</div>
              </div>)
            })}
          </div>
          <div className="message-input-wrapper">
            <input type="text" value={this.state.message} onChange={el => this.setState({message: el.target.value})} placeholder="Your message" />
            <button type="button" onClick={this.handleSubmit}>Send</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
