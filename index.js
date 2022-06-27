import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constant.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected");
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
}

// To send a transaction, needs:
// provider / connection to blockchain
// signer / wallet / someone with gas
// contract address we are interacting with :ABI & Address

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}`);
  // provider / connection to blockchain
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  console.log(provider);
  // signer / wallet / someone with gas
  const signer = provider.getSigner();
  console.log(signer);
  // contract address we are interacting with
  const contract = new ethers.Contract(contractAddress, abi, signer);
  console.log(contract);
  try {
    const transactionResponse = await contract.fund({
      value: ethers.utils.parseEther(ethAmount),
    });
    // listen for the tx to be mined
    await listenForTransactionMine(transactionResponse, provider);
    console.log("Done");
  } catch (error) {
    console.log(error);
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  //   listen for this transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Complete with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
