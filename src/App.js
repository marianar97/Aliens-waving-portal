import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"


const App = () => {
 /*
    * Just a state variable we use to store our user's public wallet.
    */
    const [currentAccount, setCurrentAccount] = useState("");
    const [allWaves, setAllWaves] = useState([]);
    const [connect, setConnect] = useState(false);
    const [message, setMessage] = useState("");
    const contractAddress = "0x4ED252a23D3c393822a0971984b4cF8E7231D66e";
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
          setConnect(true);
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
          getAllWaves();
        } else {
          setConnect(false);
          console.log("No authorized account found");
        }

      } catch (error) {
        console.log(error);
      }
  }

  const submit = () => {
        console.log("calling submit");
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
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
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
        const waveTxn = await waveportalContract.wave();
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

const handleSubmit = (e) => {
  console.log("CHANGEEE");
}

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
    </div>
    </div>

    )
  }
}

export default App

