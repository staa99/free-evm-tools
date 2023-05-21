# Scheduler
##### Simple Scheduling for Smart Contract Interactions

### API

Send a signed transaction to the API and specify an execution time. We'll send it to the mempool at the specified time.
There can be up to 1 minute between the specified time and when it lands on the mempool. However, it will not land on
the mempool before the specified time. This limitation is a result of the decentralized nature of the blockchain. 
Propagating transactions between nodes can take some time.
