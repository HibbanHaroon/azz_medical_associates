import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

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
        borderRadius: 40, // Adjust width of bars
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
      datalabels: {
        anchor: 'end',
        align: 'start',
        formatter: (value, context) => {
          if (value === 0) {
            return ''; // Do not display label for zero values
          }
          return context.chart.data.labels[context.dataIndex];
        },
        font: {
          size: 10,
        },
        color: theme.palette.text.primary,
        rotation: (context) => {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          const previousValue = index > 0 ? context.dataset.data[index - 1] : null;
          const nextValue = index < context.dataset.data.length - 1 ? context.dataset.data[index + 1] : null;

          return (value === previousValue || value === nextValue) ? 90 : 0;
        },
        offset: (context) => context.dataset.data[context.dataIndex] === 0 ? 0 : -15,
      },
    },
    scales: {
      x: {
        display: false, // Hide x-axis labels
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
    <Box sx={{ width: '100%', height: '95%' }}>
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default BarcharttotalProvidersPerClinic;
