import React, { useState, useEffect, useCallback } from 'react';
import { getCombinedData, getTransactions } from './services/api';
import TransactionTable from './components/TransactionTable';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';
import StatisticsBox from './components/StatisticsBox';

function App() {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState('03'); // Default to March
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await getCombinedData(month);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching combined data:', error);
    }
  }, [month]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await getTransactions(page, perPage, month, search);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [month, page, perPage, search]);

  useEffect(() => {
    fetchData();
    fetchTransactions();
  }, [fetchData, fetchTransactions]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setPage(1); // Reset to first page when the month changes
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1)); // Avoid going below page 1
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  return (
    <div className="App">
      <h1>Transaction Dashboard</h1>

      {/* Month Selection Dropdown */}
      <div>
        <label htmlFor="month-select">Select Month: </label>
        <select id="month-select" value={month} onChange={handleMonthChange}>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      {/* Search Box */}
      <div>
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={handleSearchChange}
        />
        <button onClick={handleClearSearch}>Clear</button>
      </div>

      {/* Transactions Table */}
      {transactions.length > 0 ? (
        <TransactionTable transactions={transactions} />
      ) : (
        <p>No transactions found.</p>
      )}

      {/* Pagination */}
      <div>
        <button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={handleNextPage}>Next</button>
      </div>

      {/* Statistics Box */}
      {data ? <StatisticsBox data={data.statistics} /> : <p>Loading statistics...</p>}

      {/* Bar Chart */}
      {data ? <BarChart data={data.barChartData} /> : <p>Loading bar chart...</p>}

      {/* Pie Chart */}
      {data ? <PieChart data={data.pieChartData} /> : <p>Loading pie chart...</p>}
    </div>
  );
}

export default App;
