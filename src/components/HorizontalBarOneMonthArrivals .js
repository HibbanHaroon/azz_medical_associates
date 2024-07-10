import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HorizontalBarOneMonthArrivals = ({ data }) => {
  const theme = useTheme();

  const chartData = {
    labels: data.map(item => item.clinicName),
    datasets: [
      {
        data: data.map(item => item.todayArrivalsCount),
        backgroundColor: data.map((item, index) =>
          index === 0 ? theme.palette.success.main : theme.palette.primary.main),
        borderColor: data.map((item, index) =>
          index === 0 ? theme.palette.success.dark : theme.palette.primary.dark),
        borderWidth: 1,
        borderRadius: 5,
        barThickness: 10,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed.x}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: true, // Make sure x-axis ticks are visible to show counts
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          display: true,
          mirror: false,
          color: '#000',
          font: {
            size: 14,
          },
          padding: 10,
        },
        barPercentage: 0.8,
        categoryPercentage: 1.0,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutBounce',
    }
  };

  return (
    <Box sx={{ width: '100%', height: '240px' }}>
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default HorizontalBarOneMonthArrivals;
