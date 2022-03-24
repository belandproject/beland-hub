# NFT Market HUB
This is a hub for NFT Market network that stores the database and forwards new messages to peers. The hub hold a private keys to sign valid messages.

### Installation Prerequisites
* Install [elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started.html).
* Install [redis](https://redis.io/topics/quickstart).
* Install [postgresql](https://www.postgresql.org/docs/10/tutorial-start.html).
* Install [nodejs](https://nodejs.org/en/).
* Install [pgsync](https://pgsync.com).

### Get Started
Check .env.example and create your own .env file. Some properties have defaults.

### Start API SERVER

```
yarn install
yarn start
```
#### Start Indexer

```
yarn install
yarn start:indexer
```