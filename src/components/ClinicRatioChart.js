import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchAllArrivals } from "../services/arrivalsService";
import { fetchDoctors } from "../services/doctorService";
import { getAllClinics } from "../services/clinicService";
import { useTheme } from "@mui/material/styles";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from 'chart.js';

// Register the plugin globally
Chart.register(ChartDataLabels);

const ClinicRatioChart = () => {
  const [chartData, setChartData] = useState({ datasets: [] });
  const theme = useTheme();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false, // Hide x-axis labels
        grid: {
          display: false, // Disable vertical grid lines
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value;
            }
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
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
        rotation: 0, // Ensure labels are horizontal
        offset: -15, // Adjust the offset to position labels above the bar
      },
    },
    elements: {
      point: {
        radius: 5,
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      const clinics = await getAllClinics();
      const clinicNames = [];
      var ratios = [];

      for (const clinic of clinics) {
        const arrivals = await fetchAllArrivals(clinic.id);
        const doctors = await fetchDoctors(clinic.id);

        let ratio = 0;
        if (doctors.length > 0) {
          ratio = arrivals.length / doctors.length;
        }
        clinicNames.push(clinic.name);
        ratios.push(parseInt(ratio, 10));
      }

      const data = {
        labels: clinicNames,
        datasets: [
          {
            label: "Arrivals to Providers Ratio",
            data: ratios,
            backgroundColor: theme.palette.primary.main,
            borderColor: theme.palette.primary.dark,
            borderWidth: 0,
            barThickness: 20,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            borderRadius: 40,
          },
        ],
      };

      setChartData(data);
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: "100%", height: "95%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ClinicRatioChart;
