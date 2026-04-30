'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const queryModule = require('./query');
const createAssetModule = require('./createAsset');
const updateAssetModule = require('./updateAsset');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cors());

// GET all assets
app.get('/api/assets', async (req, res) => {
    try {
        const result = await queryModule.main('all', null);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET asset by ID
app.get('/api/assets/:id', async (req, res) => {
    try {
        const result = await queryModule.main('id', req.params.id);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET assets by department
app.get('/api/assets/search/department/:dept', async (req, res) => {
    try {
        const result = await queryModule.main('department', req.params.dept);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET assets by device type
app.get('/api/assets/search/devicetype/:type', async (req, res) => {
    try {
        const result = await queryModule.main('deviceType', req.params.type);
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create new asset
app.post('/api/assets', async (req, res) => {
    try {
        const { assetId, deviceType, brand, purchaseYear, department, assignedTo } = req.body;
        await createAssetModule.main(assetId, deviceType, brand, purchaseYear, department, assignedTo);
        res.json({ message: 'Asset created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update assignedTo
app.put('/api/assets/:id', async (req, res) => {
    try {
        const { assignedTo } = req.body;
        await updateAssetModule.main(req.params.id, assignedTo);
        res.json({ message: 'Asset updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(8080, () => console.log('IT Asset API running on port 8080'));
