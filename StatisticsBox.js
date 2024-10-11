import React from 'react';

const StatisticsBox = ({ data }) => {
  return (
    <div className="statistics-box">
      <div className="stat-item">
        <h3>Total Sale Amount</h3>
        <p>{data.totalSaleAmount}</p>
      </div>
      <div className="stat-item">
        <h3>Total Sold Items</h3>
        <p>{data.totalSoldItems}</p>
      </div>
      <div className="stat-item">
        <h3>Total Unsold Items</h3>
        <p>{data.totalNotSoldItems}</p>
      </div>
    </div>
  );
};

export default StatisticsBox;
