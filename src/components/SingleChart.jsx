import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import '../styles/main.css';

const SingleChart = ({ sensorTemps, currentSensor, m, c }) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (chartRef.current && !chartInstance) {
      const chart = Highcharts.chart(chartRef.current, {
        chart: {
          type: 'line',
        },
        title: {
          text: `Temperature for ${currentSensor}`,
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
        series: [{
          name: currentSensor,
          data: [],
          type: 'line',
          color: '#FF0000',
          marker: {
            symbol: 'circle',
            radius: 3,
            fillColor: '#00ff00',
          },
        }],
      });

      setChartInstance(chart);
    }
  }, [chartRef, chartInstance, currentSensor]);

  useEffect(() => {
    if (chartInstance) {
      // Apply linear transformation y = mx + c
      const gradient = parseFloat(m) || 1;
      const intercept = parseFloat(c) || 0;

      if (sensorTemps[currentSensor]) {
        const transformedTemp =
          gradient * sensorTemps[currentSensor] + intercept;

        chartInstance.series[0].addPoint(
          [new Date().getTime(), transformedTemp],
          true,
          chartInstance.series[0].data.length >= 100 // Limit data points to the last 100 for performance
        );
      }
      chartInstance.redraw();
    }
  }, [chartInstance, sensorTemps, currentSensor, m, c]);

  return (
    <div className="chart-container">
      <div id="chart-temperature" ref={chartRef}></div>
    </div>
  );
};

export default SingleChart;
