# 🖥️ University IT Asset Management System
### Built on Hyperledger Fabric (Based on FabCar Lab)

A decentralized application for tracking university IT equipment (laptops, projectors, monitors, etc.) on a blockchain ledger using Hyperledger Fabric.

---

## 📋 Table of Contents
- [What Changed from FabCar](#-what-changed-from-fabcar)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [How to Run (First Time Setup)](#-how-to-run-first-time-setup)
- [How to Restart](#-how-to-restart-the-server)
- [How to Stop](#-how-to-stop-the-network)
- [API Endpoints](#-api-endpoints)
- [Features](#-features)

---

## 🔄 What Changed from FabCar

This project is a modification of the FabCar lab. Below is a clear comparison of every change made.

### Files Modified

| File | FabCar (Original) | IT Asset System (Modified) |
|------|-------------------|---------------------------|
| `chaincode-javascript/lib/fabcar.js` | Manages Car objects (color, make, model, owner) | Manages IT Asset objects (deviceType, brand, purchaseYear, department, assignedTo) |
| `api-server/index.js` | Routes for cars: GET /api/queryallcars, POST /api/createcar, PUT /api/changecarowner | Routes for assets: GET /api/assets, POST /api/assets, PUT /api/assets/:id, GET /api/assets/search/department/:dept, GET /api/assets/search/devicetype/:type |
| `api-server/query.js` | Only queries all cars or by car ID | Queries all assets, by ID, by department, or by device type |
| `fabcar-client/index.html` | UI for cars (color, make, model, owner fields) | UI for IT assets (deviceType, brand, purchaseYear, department, assignedTo fields) |

### Files Added (New)

| File | Purpose |
|------|---------|
| `api-server/createAsset.js` | Replaces `createCar.js` — submits a new IT asset to the ledger |
| `api-server/updateAsset.js` | Replaces `changeOwner.js` — updates the `assignedTo` field of an asset |

### Files NOT Changed (as required by project spec)

| File | Reason |
|------|--------|
| `api-server/enrollAdmin.js` | Not to be modified per project instructions |
| `api-server/registerUser.js` | Not to be modified per project instructions |
| `startFabric.sh` | Network configuration — not modified |
| `networkDown.sh` | Network configuration — not modified |

### Chaincode Changes in Detail

| Feature | FabCar | IT Asset System |
|---------|--------|-----------------|
| Data fields | color, make, model, owner | deviceType, brand, purchaseYear, department, assignedTo |
| Create function | `createCar()` | `createAsset()` |
| Update function | `changeCarOwner()` | `updateAssignedTo()` |
| Search by department | ❌ Not available | ✅ `queryAssetsByDepartment()` using CouchDB |
| Search by device type | ❌ Not available | ✅ `queryAssetsByDeviceType()` using CouchDB |
| Query by ID | ✅ `queryCar()` | ✅ `queryAsset()` |
| Query all | ✅ `queryAllCars()` | ✅ `queryAllAssets()` |

---

## ✅ Prerequisites

Before running this project, make sure you have the following installed:

- **Ubuntu 20.04 / 22.04** (recommended)
- **Git** — `sudo apt-get install git`
- **Docker** — v20.x or higher
- **Docker Compose** — v1.29.2
- **Node.js** — v18.x (strongly recommended)
- **npm** — comes with Node.js
- **Hyperledger Fabric v2.5** binaries and docker images
- **jq** — `sudo apt-get install jq`

> ⚠️ Do NOT use Node.js v20+ or v24+. Use Node.js v18 for best compatibility with fabric-network SDK.

To install Node.js v18:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 📁 Project Structure

```
fabcar/
├── chaincode-javascript/
│   └── lib/
│       └── fabcar.js          ← Smart contract (chaincode) — MODIFIED
├── api-server/
│   ├── enrollAdmin.js         ← DO NOT TOUCH
│   ├── registerUser.js        ← DO NOT TOUCH
│   ├── index.js               ← Express API server — MODIFIED
│   ├── query.js               ← Query handler — MODIFIED
│   ├── createAsset.js         ← NEW FILE
│   ├── updateAsset.js         ← NEW FILE
│   └── package.json
├── fabcar-client/
│   └── index.html             ← Frontend UI — MODIFIED
├── startFabric.sh
└── networkDown.sh
```

---

## 🚀 How to Run (First Time Setup)

Follow these steps **in order** on a fresh machine.

### Step 1: Install Hyperledger Fabric

```bash
mkdir ~/fabric && cd ~/fabric
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
chmod +x install-fabric.sh
./install-fabric.sh
```

This creates `~/fabric/fabric-samples/` with all required binaries.

### Step 2: Clone this repository

```bash
cd ~/fabric/fabric-samples
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git fabcar
```

> Replace `YOUR_USERNAME/YOUR_REPO_NAME` with the actual GitHub repository URL.

### Step 3: Clean any old Docker state

```bash
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker volume prune -f
docker network prune -f
```

### Step 4: Start the Fabric network and deploy chaincode

```bash
cd ~/fabric/fabric-samples/test-network

# Remove any leftover crypto/channel artifacts
rm -rf channel-artifacts/ organizations/peerOrganizations/ organizations/ordererOrganizations/

# Start network with CouchDB (required for rich queries)
./network.sh up createChannel -ca -s couchdb

# Wait for peers to fully start
sleep 10

# Deploy the chaincode
./network.sh deployCC -ccn fabcar -ccp ../fabcar/chaincode-javascript -ccl javascript
```

### Step 5: Install dependencies and start the API server

```bash
cd ~/fabric/fabric-samples/fabcar/api-server
npm install
npm install morgan

# Enroll admin and register user
node enrollAdmin.js
node registerUser.js

# Start the backend server
npm start
```

You should see:
```
IT Asset API running on port 8080
```

### Step 6: Open the frontend

Open `fabcar-client/index.html` in VS Code and click **"Go Live"** from the Live Server extension (bottom-right of VS Code).

Your browser will open the IT Asset Management UI at `http://127.0.0.1:5500`.

---

## 🔄 How to Restart the Server

If the API server is stopped (e.g., you closed the terminal) but the **Fabric network is still running** (Docker containers still up):

```bash
# Check if network is still running
docker ps | grep peer

# If you see peer containers, just restart the API:
cd ~/fabric/fabric-samples/fabcar/api-server
npm start
```

If the **network was stopped** (e.g., PC was rebooted):

```bash
# Full restart — run these in order:

cd ~/fabric/fabric-samples/test-network
./network.sh down
docker volume rm compose_orderer.example.com compose_peer0.org1.example.com compose_peer0.org2.example.com 2>/dev/null || true
docker volume prune -f
rm -rf channel-artifacts/ organizations/peerOrganizations/ organizations/ordererOrganizations/

./network.sh up createChannel -ca -s couchdb
sleep 10
./network.sh deployCC -ccn fabcar -ccp ../fabcar/chaincode-javascript -ccl javascript

cd ~/fabric/fabric-samples/fabcar/api-server
rm -rf wallet/
node enrollAdmin.js
node registerUser.js
npm start
```

> ⚠️ Always delete the `wallet/` folder when restarting the network from scratch, otherwise you'll get credential errors.

---

## 🛑 How to Stop the Network

```bash
cd ~/fabric/fabric-samples/fabcar
./networkDown.sh
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | Get all IT assets |
| GET | `/api/assets/:id` | Get asset by unique ID (e.g. ASSET001) |
| GET | `/api/assets/search/department/:dept` | Get all assets in a department (e.g. CSE) |
| GET | `/api/assets/search/devicetype/:type` | Get all assets of a type (e.g. Laptop) |
| POST | `/api/assets` | Create a new asset |
| PUT | `/api/assets/:id` | Update the assignedTo field of an asset |

### POST Body Example (Create Asset)
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

### PUT Body Example (Update Assignee)
```json
{
  "assignedTo": "Dr. New Person"
}
```

---

## ✨ Features

- **Create**: Add new IT assets to the blockchain ledger
- **Read All**: View all registered assets across the university
- **Update**: Transfer an asset from one faculty/staff to another
- **Search by ID**: Look up a specific asset (e.g. ASSET001)
- **Search by Department**: Find all assets in a department (e.g. CSE, EEE)
- **Search by Device Type**: Find all assets of a type (e.g. all Projectors)

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `Cannot find module 'morgan'` | Run `npm install morgan` inside `api-server/` |
| `ledger already exists` | Delete volumes: `docker volume prune -f` and delete `channel-artifacts/` and `organizations/` folders |
| `connection refused on port 7051` | Peer not ready yet — wait 10 seconds after `network.sh up` before deploying chaincode |
| `Cannot find module './createAsset'` | Create `createAsset.js` and `updateAsset.js` files in `api-server/` (see project files) |
| Wallet errors after network restart | Delete `api-server/wallet/` folder, then re-run `enrollAdmin.js` and `registerUser.js` |

---

## 📝 Notes

- This project uses **CouchDB** as the state database, which enables rich queries (search by department, device type).
- The chaincode name is `fabcar` (kept same as original to avoid config changes).
- The API runs on **port 8080**.
- The frontend uses plain HTML/JS and communicates with the API via `fetch()`.
