
'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main(assetId, deviceType, brand, purchaseYear, department, assignedTo) {
    const ccpPath = path.resolve(__dirname, '..', '..', 'test-network',
        'organizations', 'peerOrganizations', 'org1.example.com',
        'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
        throw new Error('Run enrollAdmin.js and registerUser.js first');
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('fabcar');

    await contract.submitTransaction(
        'createAsset', assetId, deviceType, brand, purchaseYear, department, assignedTo
    );

    await gateway.disconnect();
}

module.exports = { main };

