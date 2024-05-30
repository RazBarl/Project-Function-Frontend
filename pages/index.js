import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [showAddress, setShowAddress] = useState(true);
  const [amount, setAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [gameId, setGameId] = useState(0);
  const [gamesList, setGamesList] = useState([
    { id: 1, name: "STARDEW VALLEY", value: 1 },
    { id: 2, name: "Surviving Mars", value: 2 },
    { id: 3, name: "Total War SHOGUN 2", value: 3 },
    { id: 4, name: "Total War Warhammer 2", value: 4 },
    { id: 5, name: "No Man Sky", value: 5 },
    { id: 6, name: "Valorant", value: 6 },
    { id: 7, name: "Assassin's Creed Origins", value: 7 },
    { id: 8, name: "Assassin's Creed Odyssey", value: 8 },
    { id: 9, name: "Star Wars Empire at war", value: 9 },
    { id: 10, name: "GTA VI", value: 10 }
  ]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && amount) {
      const depositAmount = parseInt(amount);
      if (depositAmount > 0 && depositAmount <= 10) {
        let tx = await atm.deposit(depositAmount, { value: ethers.utils.parseEther(amount) });
        await tx.wait();
        setBalance(balance + depositAmount);
        setShowError(false);
      } else {
        setErrorMessage("You can only deposit up to 10 Tokens only");
        setShowError(true);
      }
    }
  };

  const withdraw = async () => {
    if (atm && amount) {
      const withdrawAmount = parseInt(amount);
      if (withdrawAmount > 0 && withdrawAmount <= balance) {
        let tx = await atm.withdraw(withdrawAmount);
        await tx.wait();
        setBalance(balance - withdrawAmount);
        setShowError(false);
      } else {
        setErrorMessage("You can only withdraw up to 10 Tokens only");
        setShowError(true);
      }
    }
  };

  const transfer = async () => {
    if (atm) {
      if (!transferAmount && !recipient) {
        setErrorMessage("Please enter a value first");
        setShowError(true);
        return;
      }
  
      if (!transferAmount) {
        setErrorMessage("Please enter an amount of up to 10 tokens");
        setShowError(true);
        return;
      }
  
      if (!recipient) {
        setErrorMessage("Please enter a valid address (e.g., 0x5FbDB2315678afecb367f032d93F642f64180aa3)");
        setShowError(true);
        return;
      }
  
      const amountToTransfer = parseInt(transferAmount);
      if (amountToTransfer > 0 && amountToTransfer <= 10 && ethers.utils.isAddress(recipient)) {
        try {
          let tx = await atm.transfer(recipient, amountToTransfer);
          await tx.wait();
          setBalance(balance - amountToTransfer);
          setShowError(false);
        } catch (error) {
          setErrorMessage("Transfer failed");
          setShowError(true);
        }
      } else {
        setErrorMessage("Please enter a valid recipient address and amount");
        setShowError(true);
      }
    }
  };  

  const toggleAddressVisibility = () => {
    setShowAddress(!showAddress);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleTransferAmountChange = (e) => {
    setTransferAmount(e.target.value);
  };

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };


  const redeem = async () => {
    if (atm && gameId > 0) {
      const selectedGame = gamesList.find(game => game.id === gameId);
      if (!selectedGame) {
        setErrorMessage("Invalid game selection");
        setShowError(true);
        return;
      }

      try {
        let tx = await atm.redeem(selectedGame.value);
        await tx.wait();
        setBalance(0);
        setShowError(false);
        alert(`Redeemed ${selectedGame.name} successfully!`);
      } catch (error) {
        setErrorMessage("Redeem failed");
        setShowError(true);
      }
    } else {
      setErrorMessage("Please select a game to redeem");
      setShowError(true);
    }
  };

  const handleGameChange = (e) => {
    setGameId(parseInt(e.target.value));
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this wallet.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Open Wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="wallet-container">
        <button onClick={toggleAddressVisibility}>Hide or Show your address</button>
        {showAddress && <p>Your Current Address: {account}</p>}
        <p>Current Value: {balance}</p>
        <div className="buttons-container">
        <input type="number" value={amount} onChange={handleAmountChange} placeholder="Enter desired amount" />
          <button onClick={deposit}>Deposit</button>
          <input type="number" value={transferAmount} onChange={handleTransferAmountChange} placeholder="Enter desired amount" />
          <button onClick={withdraw}>Withdraw</button>
          <input type="text" value={recipient} onChange={handleRecipientChange} placeholder="Enter recipient address" />
          <button onClick={transfer}>Transfer</button>
          <div className="redeem-container">
          <select value={gameId} onChange={handleGameChange}>
            <option value={0}>Select a game to redeem</option>
            {gamesList.map(game => (
              <option key={game.id} value={game.id}>{game.name} - Value: {game.value} tokens</option>
            ))}
          </select>
          <button onClick={redeem}>Redeem</button>
        </div>
        </div>
        {showError && <div className="error-message">{errorMessage}</div>}
        <div className="">
          <h3>[1] Item: STARDEW VALLEY - Value: 1 </h3>
          <h3>[2] Item: Surviving Mars - Value: 2 </h3>
          <h3>[3] Item: Total War SHOGUN 2 - Value: 3 </h3>
          <h3>[4] Item: Total War Warhammer 2 - Value: 4 </h3>
          <h3>[5] Item: No Man Sky - Value: 5 </h3>
          <h3>[6] Item: Valorant - Value: 6 </h3>
          <h3>[7] Item: Assassin's Creed Origins - Value: 7 </h3>
          <h3>[8] Item: Assassin's Creed Odyssey - Value: 8 </h3>
          <h3>[9] Item: Star Wars Empire at war - Value: 9 </h3>
          <h3>[10] Item 10: GTA VI - Value: 10 </h3>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>ARL Wallet</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          padding: 20px;
        }
        .wallet-container {
          border: 1px solid #ccc;
          padding: 20px;
          border-radius: 10px;
          background-color: #f9f9f9;
          text-align: center;
          margin-top: 20px;
          width: 300px;
          position: relative;
        }
        .buttons-container {
          margin-top: 20px;
        }
        .buttons-container button {
          margin: 5px;
        }
        .error-message {
          color: red;
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #fff;
          padding: 5px 10px;
          border: 1px solid red;
          border-radius: 5px;
        }
      `}</style>
    </main>
  );
}