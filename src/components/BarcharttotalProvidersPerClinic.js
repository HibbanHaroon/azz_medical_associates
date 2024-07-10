import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarcharttotalProvidersPerClinic = ({ data }) => {
  const theme = useTheme();
  const [chartWidth, setChartWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setChartWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const maxProviders = Math.max(...data.map(clinic => clinic.providers));
const chartData = {
  labels: data.map(clinic => clinic.name),
  datasets: [
    {
      data: data.map(clinic => clinic.providers),
      backgroundColor: data.map(clinic =>
        clinic.providers === maxProviders ? theme.palette.primary.main : '#CCCCCC'
      ),
      borderColor: theme.palette.primary.dark,
      borderWidth: 0,
      barThickness: 20,
      categoryPercentage: 0.8, // Adjust spacing between bars
      barPercentage: 0.9, 
      borderRadius:40,// Adjust width of bars
      
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
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: chartWidth < 600 ? 45 : 0,
          minRotation: chartWidth < 600 ? 45 : 0,
          padding: 10,
          font: {
            weight: 'bold',
            size: chartWidth < 600 ? 12 : 10,
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
          callback: function(value) {
            return value.toString();
          }
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
    <Box sx={{ width: '100%', height: '100%' }}>
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default BarcharttotalProvidersPerClinic;
