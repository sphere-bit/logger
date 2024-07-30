import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import '../styles/main.css';

const ChartTemperature = ({ sensorTemps, selectedSensors }) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (chartRef.current && !chartInstance) {
      const chart = Highcharts.chart(chartRef.current, {
        chart: {
          type: 'line',
        },
        title: {
          text: 'DS18B20 Temperature Sensor',
        },
        xAxis: {
          type: 'datetime',
          title: {
            text: 'Time',
          },
        },
        yAxis: {
          title: {
            text: 'Temperature (°C)',
          },
        },
        series: [],
      });

      setChartInstance(chart);
    }
  }, [chartRef, chartInstance]);

  useEffect(() => {
    if (chartInstance && selectedSensors.length > 0) {
      // Remove series for unselected sensors
      chartInstance.series.forEach((series) => {
        if (!selectedSensors.includes(series.name.replace('sensor', 'b'))) {
          series.remove();
        }
      });

      selectedSensors.forEach((sensorKey) => {
        const sensorName = sensorKey.replace('b', 'sensor');
        const existingSeries = chartInstance.series.find((series) => series.name === sensorName);

        if (existingSeries) {
          // Series already exists, update its data
          existingSeries.addPoint(
            [new Date().getTime(), sensorTemps[sensorName]],
            true,
            existingSeries.data.length >= 100 // Limit data points to the last 100 for performance
          );
        } else {
          // Add new series for the selected sensor
          chartInstance.addSeries({
            name: sensorName,
            data: [[new Date().getTime(), sensorTemps[sensorName]]],
            type: 'line',
            color: '#FF0000', // You can dynamically assign colors if needed
            marker: {
              symbol: 'circle',
              radius: 3,
              fillColor: '#00ff00', // Color of the marker
            },
          });
        }
      });

      chartInstance.redraw();
    } else if (chartInstance && selectedSensors.length === 0) {
      // If no sensors are selected, clear the chart
      chartInstance.series.forEach((series) => series.remove(false));
      chartInstance.redraw();
    }
  }, [chartInstance, sensorTemps, selectedSensors]);

  return (
    <div className="chart-container">
      <h2>DS18B20 Temperature Sensor</h2>
      <div id="chart-temperature" ref={chartRef}></div>
    </div>
  );
};

export default ChartTemperature;
