# 🖥️ University IT Asset Management System
### Decentralized App on Hyperledger Fabric | Based on FabCar Lab

A blockchain-based application to track university IT equipment (Laptops, Monitors, Projectors, etc.) using Hyperledger Fabric and CouchDB.



---

## 📁 What's in This Repository

```
fabric/
├── sample/              ← The fabcar application (chaincode + API + frontend)
│   ├── chaincode-javascript/lib/fabcar.js   ← Smart contract
│   ├── api-server/                          ← Backend Node.js API
│   │   ├── index.js
│   │   ├── query.js
│   │   ├── createAsset.js
│   │   ├── updateAsset.js
│   │   ├── enrollAdmin.js
│   │   └── registerUser.js
│   └── fabcar-client/index.html             ← Frontend UI
├── install              ← Fabric install helper script
└── README.md            ← This file
```

> ⚠️ This repo contains only the **application code**. You must install Hyperledger Fabric binaries and Docker images separately (see Step 2 below).

---

## 🔄 What Changed from the Original FabCar Lab

### Modified Files

| File | Original FabCar | This Project |
|------|----------------|--------------|
| `chaincode-javascript/lib/fabcar.js` | Car data (color, make, model, owner) | IT Asset data (deviceType, brand, purchaseYear, department, assignedTo) |
| `api-server/index.js` | Car API routes | Asset API routes (create, read, update, search) |
| `api-server/query.js` | Query cars only | Query by ID, department, or device type |
| `fabcar-client/index.html` | Car management UI | IT Asset management UI |

### New Files Added

| File | Purpose |
|------|---------|
| `api-server/createAsset.js` | Submit a new IT asset to the ledger |
| `api-server/updateAsset.js` | Update who an asset is assigned to |

### Files NOT Changed (as required by assignment)

`enrollAdmin.js`, `registerUser.js`, `startFabric.sh`, `networkDown.sh` — untouched.

### New Chaincode Functions vs FabCar

| Function | FabCar | This Project |
|----------|--------|--------------|
| Create | `createCar()` | `createAsset()` |
| Read All | `queryAllCars()` | `queryAllAssets()` |
| Read One | `queryCar(id)` | `queryAsset(id)` |
| Update | `changeCarOwner()` | `updateAssignedTo()` |
| Search by Department | ❌ | ✅ `queryAssetsByDepartment()` |
| Search by Device Type | ❌ | ✅ `queryAssetsByDeviceType()` |

---

## ✅ Prerequisites

Install these before anything else:

| Tool | Version | Install Command |
|------|---------|-----------------|
| Git | Any | `sudo apt-get install git` |
| jq | Any | `sudo apt-get install jq` |
| Docker | 20.x+ | See below |
| Docker Compose | 1.29.2 | See below |
| Node.js | **v18.x** (important!) | See below |
| npm | comes with Node | — |

### Install Docker
```bash
sudo apt-get update
sudo apt-get install apt-transport-https ca-certificates gnupg-agent software-properties-common lsb-release -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io -y
sudo groupadd docker
sudo usermod -a -G docker $USER
newgrp docker
```

### Install Docker Compose
```bash
sudo curl -L https://github.com/docker/compose/releases/download/1.29.2/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Install Node.js v18
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version   # should show v18.x.x
```

---

## 🚀 First Time Setup (New User)

Follow every step in order.

### Step 1: Clone this repository

```bash
git clone https://github.com/faiyaz029/fabric.git
cd fabric
```

### Step 2: Install Hyperledger Fabric binaries and Docker images

```bash
mkdir -p ~/fabric && cd ~/fabric
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
chmod +x install-fabric.sh
./install-fabric.sh
```

This creates `~/fabric/fabric-samples/` directory with all Fabric binaries.

> ⏳ This takes time depending on your internet speed. Wait for it to fully complete.

### Step 3: Copy the application into fabric-samples

```bash
cp -r ~/fabric/fabric/sample ~/fabric/fabric-samples/fabcar
```

> This puts the project code where Fabric expects it.

### Step 4: Clean any leftover Docker state

```bash
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker volume prune -f
docker network prune -f
```

### Step 5: Start the Fabric network

```bash
cd ~/fabric/fabric-samples/test-network
./network.sh up createChannel -ca -s couchdb
```

Wait until you see:
```
Channel 'mychannel' created
Successfully submitted proposal to join channel   ← appears twice
```

Then wait for peers to fully initialize:
```bash
sleep 15
```

### Step 6: Deploy the chaincode

```bash
./network.sh deployCC -ccn fabcar -ccp ../fabcar/chaincode-javascript -ccl javascript
```

Wait for it to finish. You should see `Chaincode deployment successful`.

### Step 7: Install dependencies and start the API server

```bash
cd ~/fabric/fabric-samples/fabcar/api-server
npm install
npm install morgan
node enrollAdmin.js
node registerUser.js
npm start
```

You should see:
```
IT Asset API running on port 8080
```

**Leave this terminal running.**

### Step 8: Open the frontend

- Open VS Code
- Open the file `fabcar-client/index.html`
- Click **Go Live** at the bottom-right of VS Code (requires Live Server extension)
- Browser opens at `http://127.0.0.1:5500`

✅ **You are ready to use the application!**

---

## 🔄 How to Restart (After PC Reboot or Network Stopped)

Run this single block — it cleans everything and starts fresh:

```bash
# === CLEAN ===
cd ~/fabric/fabric-samples/test-network
./network.sh down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker volume rm compose_orderer.example.com compose_peer0.org1.example.com compose_peer0.org2.example.com 2>/dev/null || true
docker volume prune -f
docker network prune -f
docker rmi $(docker images | grep 'dev-peer' | awk '{print $3}') 2>/dev/null || true
rm -rf channel-artifacts/
rm -rf organizations/peerOrganizations/
rm -rf organizations/ordererOrganizations/
rm -rf ~/fabric/fabric-samples/fabcar/api-server/wallet/

# === START NETWORK ===
./network.sh up createChannel -ca -s couchdb
sleep 15

# === DEPLOY CHAINCODE ===
./network.sh deployCC -ccn fabcar -ccp ../fabcar/chaincode-javascript -ccl javascript

# === START API ===
cd ~/fabric/fabric-samples/fabcar/api-server
node enrollAdmin.js
node registerUser.js
npm start
```

---

## 🛑 How to Stop the Network

```bash
cd ~/fabric/fabric-samples/fabcar
./networkDown.sh
```

---

## 🌐 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `http://localhost:8080/api/assets` | Get all IT assets |
| GET | `http://localhost:8080/api/assets/ASSET001` | Get one asset by ID |
| GET | `http://localhost:8080/api/assets/search/department/CSE` | Get all assets in a department |
| GET | `http://localhost:8080/api/assets/search/devicetype/Laptop` | Get all assets of a type |
| POST | `http://localhost:8080/api/assets` | Add a new asset |
| PUT | `http://localhost:8080/api/assets/ASSET001` | Update assigned person |

### POST Example Body
```json
{
  "assetId": "ASSET006",
  "deviceType": "Laptop",
  "brand": "Lenovo",
  "purchaseYear": "2024",
  "department": "CSE",
  "assignedTo": "Dr. Islam"
}
```

### PUT Example Body
```json
{
  "assignedTo": "Dr. New Person"
}
```

---

## ✨ Features

- ➕ **Create** — Add new IT assets to the blockchain ledger
- 📋 **Read All** — View all assets across the university
- ✏️ **Update** — Transfer an asset to a different faculty/staff member
- 🔍 **Search by Asset ID** — Look up a specific asset (e.g. ASSET001)
- 🔍 **Search by Department** — Find all assets in a department (e.g. CSE, EEE, BBA)
- 🔍 **Search by Device Type** — Find all assets of a specific type (e.g. all Projectors)

---

## 🐛 Common Errors and Fixes

| Error Message | Fix |
|--------------|-----|
| `Cannot find module 'morgan'` | `npm install morgan` inside `api-server/` |
| `ledger already exists` | Run the full clean restart block above |
| `connection refused port 7051` | Run `sleep 15` after network starts, then retry deployCC |
| `channel already exists (405)` | Run `docker volume prune -f` and delete `channel-artifacts/` and `organizations/` folders |
| `Cannot find module './createAsset'` | `createAsset.js` is missing in `api-server/` — check all files were copied |
| Wallet / credential errors | Delete `api-server/wallet/` folder then re-run `enrollAdmin.js` and `registerUser.js` |
| `After 5 attempts, peer failed to join` | Add `sleep 15` after `network.sh up` before deploying chaincode |

---

## 📝 Important Notes

- **Node.js v18** is required. v20+ or v24+ cause compatibility issues with the Fabric SDK.
- **CouchDB** is required for the search-by-department and search-by-device-type features (rich queries).
- The chaincode is internally named `fabcar` to stay compatible with the original lab config.
- The API server runs on **port 8080**.
- Always **delete the wallet folder** when restarting the network from scratch.

