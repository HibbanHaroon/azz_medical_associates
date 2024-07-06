// MonthlyArrivalsChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import { useTheme } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const MonthlyArrivalsChart = ({ data }) => {
  const theme = useTheme();

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: theme.palette.success.main, // Greenish color
        borderColor: theme.palette.success.dark,
        borderWidth: 1,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function (tooltipItems) {
            return data[tooltipItems[0].dataIndex].monthFull; // Show full month name on hover
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            weight: 'bold',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            weight: 'bold',
          },
        },
        grid: {
          drawBorder: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutBounce',
    },
  };

  return (
    <div style={{ width: '100%', height: '90%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MonthlyArrivalsChart;
