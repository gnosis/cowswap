# CowSwap FAQ
## General

### What is CowSwap?
CowSwap is a proof-of-concept dapp (decentralized application) built on Gnosis Protocol v2 (GPv2). CowSwap offers the decentralized finance community a teaser of the capabilities of GPv2  through testing upcoming features while placing gas free trades. Milk it! 

### What is MEV and how much MEV has been extracted from users to date?
Initially [defined](https://research.paradigm.xyz/MEV) by the Paradigm research team, MEV is “a measure of the profit a miner (or validator, sequencer, etc.) can make through their ability to arbitrarily include, exclude, or re-order transactions within the blocks they produce.” 


From only this January 2021 to now, the total amount of value extracted by miners (etc.) on Ethereum transactions has reached [$ 382.4 Million, including successful and failed transactions.](https://explore.flashbots.net/)

### To what does the term Coincidence of Wants (CoWs) refer?

Coincidence of Wants (CoWs) can be [explained](https://en.wikipedia.org/wiki/Coincidence_of_wants) as “an economic phenomenon where two parties each hold an item the other wants, so they exchange these items directly.” CowSwap facilitates CoWs among traders and their orders through using batch auctions as a core mechanism. 


This means, on CowSwap, when two traders each hold an asset the other wants, a trade can be settled directly between them without an external market maker or liquidity provider. This leads to better prices for the individual traders (because traditionally market makers add a fee—referred to as spread—for their surface). 


CowSwap allows for coincidence of wants (CoWs) orders to be traded directly against one another. Only the excess order amount that cannot be settled directly with other CowSwap traders are sent to the underlying AMMs (automated market makers). 

### How am I protected from MEV (Arbitrage, Front running, Sandwiching) with CowSwap?
CowSwap leverages batch auctions with uniform clearing prices for all trades in the same batch. Because of the uniform clearing price , there is no need for ordering the transactions within a single batch. Because everyone receives the same price across assets it’s not possible for _any_ value to be extracted by placing transactions in a certain order. This prevents the primary strategy used in MEV.


Batches are decentrally settled by an external, independent party (called “solvers”) on-chain. Solvers are a person or entity who submits order settlement solutions that maximize trade surplus for a given batch. Solvers are incentivized to implement professional transaction management techniques that allow them to set very tight slippage bounds on any interactions with external liquidity sources (e.g. trading CoW excess on Uniswap). This dramatically reduces the manipulation surface of miners and front-runners.


Additionally, depending on the composition of the orders submitted and valid for a given batch, the existence of CoWs may significantly reduce the amount that has to be exchanged via external MEV-prone protocols, such as Uniswap.

### How does CowSwap determine prices?
CowSwap settles batch auctions in discrete time intervals. In the absence of other traders, CowSwap matches traders against the best available Uniswap liquidity (note: other base-liquidity sources such as Balancer are being added soon).


If CoWs (Coincidence of Wants) orders exist in a batch, the “smaller” order is matched fully with the larger order. The excess of the larger order is settled with the best available base liquidity CowSwap integrates with, which is, for now, Uniswap. The clearing price for both orders will be the price of the token with the excess amount on external liquidity sources to which the protocol is connected.


Finding the order best settlement is a challenging task, which may have its own [decentralized competition](https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245) very soon. 

### Is CowSwap secure to use?
CowSwap is in ongoing development, and that is why this is not a beta product but rather a proo-of-concept dapp for the community to test and leverage before the final version is released. 


The code has been carefully tested and peer-reviewed. Although this can be seen as a step forward in terms of security, it's recommended to use the protocol at your own risk. 

## Protocol
### What is CowSwap’s fee model?
Each executed order has a fee which is captured by the protocol. Part of the fee is paid to solvers (entities which provide order settlement solutions) to incentivize their participation. 


Note that CowSwap trades don’t incur any gas costs for the trader. The protocol currently subsidizes all gas fee costs. 

### How does CowSwap connect to all on-chain liquidity?
CowSwap can connect to all on-chain liquidity with the following mechanism: 

* AMMs → because of the composability of Ethereum, when CowSwap does not have enough CoWs (Coincidence of Wants) among the orders available for a batch, it taps other AMMs’ liquidity to be able to settle the traders’ orders. Gnosis Protocol v2 can be connected to any on-chain liquidity sources and can therefore enjoy the benefits of concentrating the fragmented liquidity across decentralized finance.

### How is CowSwap able to offer better prices than aggregators themselves?
Before using on-chain liquidity, CowSwap tries to find CoWs (Coincidences of Wants) within the set of currently valid orders and match them directly with one another. CoWs result in better prices because no fee is paid to the liquidity provider (e.g. 0.3% for Uniswap v2). In the case that CowSwap does not have CoWs, it taps into the DEX that gives the next best price. This results in the same or better performance than existing DEX aggregators. 

### How can I become a liquidity provider?
CowSwap does not have liquidity providers. Instead, it connects to all on-chain liquidity that is provided across different protocols. Since orders only incur a cost if traded, active market makers can observe the orderbook and place counter orders (creating a CoW) to prevent settling trades via external liquidity.


## Trading
### What types of orders does CowSwap support?
At the moment, only limit sell and buy orders (fill-or-kill) are enabled. 

### What token pairs does CowSwap allow to trade?
Any valid ERC20 token pair for which there is some basic liquidity on a DEX (like Uniswap or Balancer).

### Why is CowSwap able to offer gas-free trades?
CowSwap is able to offer gas-free trades because the orders are submitted off-chain via signed messages. Once you approve your funds for spending on the dapp, you can submit orders via signed messages that contain the trade’s details, such as limit price, amount, timestamp, and so on. 

### Do I need ETH to trade?
For the trade itself you do not need to hold ETH. Although, in order to be able to trade on CowSwap, you first need to approve your funds for spending on the dapp<small>**</small>. For that action, you need ETH to pay for gas fees. Once you’ve done this, ETH is no longer required as CowSwap charges the fee from the sell token. 


<small>** In the neartime future, if you are trying to sell an ERC20 that allows offline approvals, then the ETH needed to pay for allowing your funds to be spent is not needed anymore, making the trading experience fully gas-free. Keep in mind that this is only possible with ERC20 tokens that have such functionality; if not, you will need ETH to execute the approval transaction only.</small>

### How does a trader submit a valid order in CowSwap?
In order for a trader to submit a valid order to CowSwap, they must do the following steps:

1. Approve the CowSwap smart contract to spend the token on your behalf. By executing this smart contract interaction you are approving the contract to withdraw the funds from your wallet once the trade you have signed has been filled in a batch auction. 
2. Once the approval has been mined, the next step is to sign a meta-tx in which you will see the parameters of the order you are about to place in the CowSwap interface. After that, there's nothing else to do. 
3. Once the order is executed, you will see a notification in the CowSwap UI and hear a confirming “Moo” sound.  

### Why does the UI dapp have a warning ”Fees exceed From amount”?
In order for solvers (order settlement solution providers) to be economically viable, they need to take into account how much gas they spend executing the settlement transaction. The protocol’s fee ensures that solvers are incentivized to include the order in a settlement (similar to how gas is paid on traditional DEXs). The fee is directly taken from the sell amount, which therefore has to have a certain minimum size.

### Why do I need to approve a token before trading?
When an order is executed, the settlement contract withdraws the sell amount from the trader’s token balance via the Allowance Manager (for more information cf. [Smart Contract Architecture](https://github.com/gnosis/gp-v2-contracts)). In order to allow that to happen, the trader has to first approve the Allowance Manager contract to spend tokens on their behalf. The smart contract logic ensures that no token can be spent without deliberately signing an order for it.

### Why do I sign a message instead of sending a transaction to place an order?
Signing a message incurs no gas cost and is therefore free to the user. When placing an order, the protocol cannot guarantee that the order will be executed (e.g. the price could change to no longer satisfy the specified limit). By only signing the intent to trade, we can ensure that users only incur a cost when their trade is successfully executed. 


Furthermore, by splitting the intent to trade (that is token, amount, and limit price) from the actual on-chain execution, the protocol can react to on-chain race conditions and, for example, change the trading route an order is matched against without requiring the user to submit a new order.

### Can I buy and sell ETH in CowSwap?

Yes, you can directly place buy and sell orders for ETH. Before the actual order is placed, the UI will allow you to wrap and unwrap ETH into WETH without needing to leave the dapp’s UI. 

<hr />

Didn't find an answer? Join the [community on Discord](https://discord.gg/FCfyBSbCU5) for support.

<!--
## Discarded Questions to be added later
*   **How can I cancel an order that I placed on CowSwap?

	Canceling an order in CowSwap can be done in two different ways:

1. Calling the Cowsap API to signal that you want to cancel a specific order. In this case, the cancellation is completely free as it does not require any onchain interaction. 
2. Calling the CowSwap contract to register onchain that you want to cancel a specific order. In this case the cancellation does have a cost as the onchain interaction requires gas fees. 
-->