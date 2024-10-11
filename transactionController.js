const axios = require('axios');
const Transaction = require('../models/Transaction');

exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get(process.env.THIRD_PARTY_API_URL);
    await Transaction.deleteMany({});
    await Transaction.insertMany(response.data);
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Error initializing database' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const skip = (page - 1) * perPage;

    console.log('Received query params:', { page, perPage, search, month });

    let query = {};
    if (month) {
      query.dateOfSale = {
        $regex: new RegExp(`-${month.padStart(2, '0')}-`),
      };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } },
      ];
    }

    console.log('Constructed query:', JSON.stringify(query, null, 2));

    const total = await Transaction.countDocuments(query);
    console.log('Total documents matching query:', total);

    const transactions = await Transaction.find(query)
      .skip(skip)
      .limit(Number(perPage))
      .lean();

    console.log('Retrieved transactions:', JSON.stringify(transactions, null, 2));

    res.json({
      total,
      page: Number(page),
      perPage: Number(perPage),
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions', details: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const monthRegex = new RegExp(`-${month.padStart(2, '0')}-`);

    const totalSaleAmount = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: monthRegex }, sold: true } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: { $regex: monthRegex },
      sold: true
    });

    const totalNotSoldItems = await Transaction.countDocuments({
      dateOfSale: { $regex: monthRegex },
      sold: false
    });

    res.json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Error fetching statistics' });
  }
};

exports.getBarChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const monthRegex = new RegExp(`-${month.padStart(2, '0')}-`);

    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity }
    ];

    const barChartData = await Promise.all(priceRanges.map(async (range) => {
      const count = await Transaction.countDocuments({
        dateOfSale: { $regex: monthRegex },
        price: { $gte: range.min, $lte: range.max }
      });
      return {
        range: `${range.min} - ${range.max === Infinity ? 'above' : range.max}`,
        count
      };
    }));

    res.json(barChartData);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).json({ error: 'Error fetching bar chart data' });
  }
};

exports.getPieChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const monthRegex = new RegExp(`-${month.padStart(2, '0')}-`);

    const pieChartData = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: monthRegex } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(pieChartData);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).json({ error: 'Error fetching pie chart data' });
  }
};

exports.getCombinedData = async (req, res) => {
  try {
    const { month } = req.query;
    
    const [transactions, statistics, barChartData, pieChartData] = await Promise.all([
      axios.get(`http://localhost:5000/api/transactions?month=${month}`),
      axios.get(`http://localhost:5000/api/statistics?month=${month}`),
      axios.get(`http://localhost:5000/api/bar-chart?month=${month}`),
      axios.get(`http://localhost:5000/api/pie-chart?month=${month}`)
    ]);

    res.json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChartData: barChartData.data,
      pieChartData: pieChartData.data
    });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Error fetching combined data' });
  }
};

exports.getSample = async (req, res) => {
  try {
    const sample = await Transaction.findOne();
    res.json(sample);
  } catch (error) {
    console.error('Error fetching sample:', error);
    res.status(500).json({ error: 'Error fetching sample' });
  }
};