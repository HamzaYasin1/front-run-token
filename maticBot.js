const express = require("express");
const http = require('http');
const Web3=  require("web3")
const ethers = require("ethers");
const app = express();
const PORT = process.env.PORT || 38821;
var wss = "";
const web3 = new Web3(wss)


const secretKey = ""
const recipient = ""

const sendMatic = async(account)=>{
  const accountAddress = account.address
  console.log("accountAddress: ",accountAddress)

    let balance = await account.getBalance()

    const convertedBal = ethers.utils.formatEther(balance)
  
    console.log("convertedBal:",parseFloat(convertedBal))
    
    if (parseFloat(convertedBal) >= 0.0001) { 
          let gasPrice = await account.getGasPrice();

          const estimateTxFee = gasPrice.add(20000000000).mul(21000)
          const BN = balance.sub(estimateTxFee)

          const tx = await account.sendTransaction({
            to: recipient,
            value: BN,
            gasLimit: web3.utils.toHex(21000),
            gasPrice: gasPrice
        });

                let customWsProvider = new ethers.providers.WebSocketProvider(wss);

                try {
                        const receipt = await customWsProvider.waitForTransaction(tx.hash, 3, 0);
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

  
 
}


var init = async function () {
  var customWsProvider = new ethers.providers.WebSocketProvider(wss);
  const wallet = new ethers.Wallet(secretKey);
  const account = wallet.connect(customWsProvider)
  await sendMatic(account)
};

setInterval(init, 10000);


// init();
//now we create the express server
const server = http.createServer(app);
// we launch the server
server.listen(PORT, () => {
console.log(`Listening on port ${PORT}`)});