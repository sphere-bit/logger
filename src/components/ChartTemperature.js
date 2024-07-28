import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import '../styles/main.css';

const ChartTemperature = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      Highcharts.chart(chartRef.current, {
        chart: {
          type: 'line'
        },
        title: {
          text: 'DS18B20 Temperature Sensor'
        },
        xAxis: {
          categories: data.map((_, index) => index)
        },
        series: [{
          name: 'Temperature',
          data: data
        }]
      });
    }
  }, [data]);

  return (
    <div className="chart-container">
      <h2>DS18B20 Temperature Sensor</h2>
      <div id="chart-temperature" ref={chartRef}></div>
    </div>
  );
};

export default ChartTemperature;
