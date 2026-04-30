'use strict';

const { Contract } = require('fabric-contract-api');

class AssetTransfer extends Contract {

    // Initialize ledger with sample IT assets
    async initLedger(ctx) {
        const assets = [
            {
                deviceType: 'Laptop',
                brand: 'Dell',
                purchaseYear: '2022',
                department: 'CSE',
                assignedTo: 'Dr. Rahman'
            },
            {
                deviceType: 'Projector',
                brand: 'Epson',
                purchaseYear: '2021',
                department: 'EEE',
                assignedTo: 'Dr. Karim'
            },
            {
                deviceType: 'Monitor',
                brand: 'Samsung',
                purchaseYear: '2023',
                department: 'CSE',
                assignedTo: 'Mr. Hasan'
            },
            {
                deviceType: 'Laptop',
                brand: 'HP',
                purchaseYear: '2020',
                department: 'BBA',
                assignedTo: 'Dr. Ahmed'
            },
            {
                deviceType: 'Projector',
                brand: 'BenQ',
                purchaseYear: '2022',
                department: 'CSE',
                assignedTo: 'Ms. Nadia'
            },
        ];

        for (let i = 0; i < assets.length; i++) {
            assets[i].docType = 'asset';
            await ctx.stub.putState(
                'ASSET00' + (i + 1),
                Buffer.from(JSON.stringify(assets[i]))
            );
            console.info('Added <--> ', assets[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    // CREATE: Add a new IT asset
    async createAsset(ctx, assetId, deviceType, brand, purchaseYear, department, assignedTo) {
        console.info('============= START : Create Asset ===========');
        const asset = {
            docType: 'asset',
            deviceType,
            brand,
            purchaseYear,
            department,
            assignedTo,
        };
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('============= END : Create Asset ===========');
    }

    // READ ALL: Get all assets
    async queryAllAssets(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    // READ ONE: Query by unique asset ID
    async queryAsset(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetId} does not exist`);
        }
        console.log(assetAsBytes.toString());
        return assetAsBytes.toString();
    }

    // UPDATE: Change the assignedTo field
    async updateAssignedTo(ctx, assetId, newAssignee) {
        console.info('============= START : updateAssignedTo ===========');
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetId} does not exist`);
        }
        const asset = JSON.parse(assetAsBytes.toString());
        asset.assignedTo = newAssignee;
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('============= END : updateAssignedTo ===========');
    }

    // SEARCH by Department (CouchDB rich query)
    async queryAssetsByDepartment(ctx, department) {
        const queryString = JSON.stringify({
            selector: {
                docType: 'asset',
                department: department
            }
        });
        return await this.getQueryResultForQueryString(ctx, queryString);
    }

    // SEARCH by Device Type (CouchDB rich query)
    async queryAssetsByDeviceType(ctx, deviceType) {
        const queryString = JSON.stringify({
            selector: {
                docType: 'asset',
                deviceType: deviceType
            }
        });
        return await this.getQueryResultForQueryString(ctx, queryString);
    }

    // Helper: execute CouchDB query
    async getQueryResultForQueryString(ctx, queryString) {
        console.info('============= getQueryResultForQueryString ===========');
        console.info(`queryString:\n${queryString}`);
        const resultsIterator = await ctx.stub.getQueryResult(queryString);
        const results = await this.getAllResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    async getAllResults(iterator, isHistory) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.tx_id;
                    jsonRes.Timestamp = res.value.timestamp;
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        iterator.close();
        return allResults;
    }
}

module.exports = AssetTransfer;
