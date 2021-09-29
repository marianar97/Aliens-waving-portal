import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './App.css';
import abi from "./utils/WavePortal.json"
import { Container, Row, Col } from 'reactstrap';



const App = () => {
 /*
    * Just a state variable we use to store our user's public wallet.
    */
    const [currentAccount, setCurrentAccount] = useState("");
    const [allWaves, setAllWaves] = useState([]);
    const [connect, setConnect] = useState(false);
    const [message, setMessage] = useState("");
    const contractAddress = "0x6F9794A1e349F76d94569C5Ea8bAbef349643969";
    const contractABI = abi.abi;



    const getAllWaves = async () => {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await waveportalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        console.log("waves cleaned", wavesCleaned)
        setAllWaves(wavesCleaned);
        } else {
          console.log("Ethereum object doesn't exist!")
        }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          setConnect(false);
          console.log("Make sure you have metamask!");
          return;
        } else {
          console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
          getAllWaves();
          await setConnect(true);
        } else {
          setConnect(false);
          console.log("No authorized account found");
        }

      } catch (error) {
        console.log(error);
      }
  }


  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      await setCurrentAccount(accounts[0]); 
      await setConnect(true);
      await getAllWaves();
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async (message) => {
    console.log("calling wave")
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await waveportalContract.wave(message, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        alert("Connect wallet first!");
        return;
      }
    } catch (error) {
      console.log(error)
    }
  }
  
const handleSubmit = async(e) => {
  e.preventDefault();
  console.log("calling getAllWaves");
  await getAllWaves();
  console.log("finished calling getAllwaves")
  console.log("calling wave");
  await wave(message);
  console.log("finished calling wave");
  window.location.reload(); 
}
  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  // ...Or in a useEffect call
useEffect(() => {
  console.log("changed connect", connect);
}, [connect]);

useEffect(() => {
  console.log("All waves", allWaves);
}, [allWaves]);


  if (!connect){
    return (
      <div className="mainContainer">

        <div className="dataContainer">
          <div className="header">
            🚀 Hey aliens!
          </div>

          <div className="bio">
            I am Martech, a software engineer with background in backend development and ML. Send me a vulcane wave 🖖
          </div>

          <button className="waveButton" onClick={wave}>
            Send me a 🖖
          </button>
          {/*
          * If there is no currentAccount render this button
          */}
          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
          {allWaves.map((wave, index) => {
            return (
              <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>)
          })}
        </div>
      </div>
    );
  } else {
    return (

      <div className="mainContainer">

        <div className="dataContainer">
          <div className="header">
            🚀 Hey aliens!
          </div>

          <div className="bio">
            I am Martech, a software engineer with background in backend development and ML. Send me a vulcane wave 🖖
          </div>
        

          <div className="create">
            <form onSubmit={handleSubmit}>
              <textarea
                required
                value = {message}
                onChange = {(e)=>setMessage(e.target.value)}
              ></textarea>
              <button>Send wave</button>
            </form>
          </div>

          {allWaves.map((w) => (
            <Container className="rd">
              <Row className="top">
                <Col>
                  Message
                </Col>
                <Col>
                  address
                </Col>
                <Col>
                  Timestamp
                </Col>
              </Row>
              <Row >
                <Col xs="4">
                  {w.message}
                </Col>
                <Col xs="4" className="address">
                  {w.address}
                </Col>
                <Col xs="4">
                  {w.timestamp.toString()} 
                </Col>
              </Row>
            </Container>
          ))}

        
        </div>
      </div>

    )
  }
}

export default App

