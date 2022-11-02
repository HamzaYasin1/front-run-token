const express = require("express");
const http = require('http');
const Web3=  require("web3")
const ethers = require("ethers");
var BigNumber = require('bignumber.js');
const app = express();
const PORT = process.env.PORT || 3888;
var wss = "";
const web3 = new Web3(wss)


const secretKey = ""
const recipient = "0xb63F4C185BBBb302125F2247Cf44a712b868b8c7"
const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"
const daiAbi = [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint)",
        "function transfer(address to, uint amount)",
        "event Transfer(address indexed from, address indexed to, uint amount)"
      ];


function erc20(account) {
  return new ethers.Contract(
        DAI,
        daiAbi,
        account
  );
}

const sellToken = async(account,gasLimit,gasPrice)=>{
  const accountAddress = account.address
  console.log("accountAddress: ",accountAddress)
  
  const tokenBalance = await erc20(account).balanceOf(accountAddress);
  console.log("Token Balance: ", ethers.utils.formatEther(tokenBalance))

  const balance = await account.getBalance()

  const convertedBal = ethers.utils.formatEther(balance)

console.log("convertedBal:",parseFloat(convertedBal))
  if(parseInt(tokenBalance) > 0) {
        if (parseFloat(convertedBal) >= 0.001) { 
                
                const walletTxn = await erc20(account).transfer(
                  recipient,
                  tokenBalance,
                  {
                        'gasLimit': gasLimit,// ethers.utils.parseUnits(gasLimit, 18).toString(),
                        'gasPrice': gasPrice,//(ethers.utils.parseUnits(gasPrice, 18)).toString()//BigNumber.from(gasPrice).mul(BigNumber.from(10).pow(18))
                  }
                )
             
                let customWsProvider = new ethers.providers.WebSocketProvider(wss);


                try {
                        const receipt = await customWsProvider.waitForTransaction(walletTxn.hash, 3, 0);
                        console.log(`Receipt after wait ():`, receipt.confirmations);
                         if (receipt && receipt.blockNumber && receipt.status === 1) { // 0 - failed, 1 - success
                        console.log(`Transaction https://polygonscan.com/tx/${receipt.transactionHash} mined, status success`);
                        } else if (receipt && receipt.blockNumber && receipt.status === 0) {
                        console.log(`Transaction https://polygonscan.com/tx/${receipt.transactionHash} mined, status failed`);
                        } else {
                        console.log(`Transaction https://polygonscan.com/tx/${receipt.transactionHash} not mined`);
                        }
                    } catch (error) {
                        console.log(`Receipt after wait error (}):`, error);
                    }
                
               
        } else {
                console.log('Matic Balance is less: ', convertedBal)
        }

  } else {
        console.log('Token Balance is not enough to send:  ', parseInt(tokenBalance))
  }
 
}


var init = async function () {
  var customWsProvider = new ethers.providers.WebSocketProvider(wss);
  const wallet = new ethers.Wallet(secretKey);
  const account = wallet.connect(customWsProvider)
  await sellToken(account,web3.utils.toHex(100000),web3.utils.toHex(159085793424));

// customWsProvider.on("pending", (tx) => {
//   customWsProvider.getTransaction(tx).then(async function (transaction) {
//   // now we will only listen for pending transaction on pancakesswap factory
//   if(transaction && transaction.to === DAI){
//           console.log(BigNumber(100000))
//           console.log(transaction.gasLimit.toString(), transaction.gasPrice.toString())
//           await sellToken(account,web3.utils.toHex(100000),web3.utils.toHex(159085793424))
//     }
//   });
// });

setTimeout(init, 1000);
// customWsProvider._websocket.on("error", async (ep) => {

//         console.log(`Unable to connect to ${ep.subdomain} retrying in 3s...`);
//         setTimeout(init, 10000);
// });

// customWsProvider._websocket.on("close", async (code) => {
//         console.log(
//         `Connection lost with code ${code}! Attempting reconnect in 3s...`
//         );
//         customWsProvider._websocket.terminate();
//         setTimeout(init, 10000);
// });
};

init();
//now we create the express server
const server = http.createServer(app);
// we launch the server
server.listen(PORT, () => {
console.log(`Listening on port ${PORT}`)});