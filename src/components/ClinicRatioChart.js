import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchAllArrivals } from "../services/arrivalsService";
import { fetchDoctors } from "../services/doctorService";
import { getAllClinics } from "../services/clinicService";
import { useTheme } from "@mui/material/styles";

const ClinicRatioChart = ({ height }) => {
  const [chartData, setChartData] = useState({ datasets: [] });
  const theme = useTheme();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: true,
        grid: {
          display: false, // Disable vertical grid lines
        },
        ticks: {
          autoSkip: false,
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
      //   console.log("heehah", clinics);
      const clinicNames = [];
      var ratios = [];

      for (const clinic of clinics) {
        const arrivals = await fetchAllArrivals(clinic.id);
        // console.log("heehah,I", arrivals);
        const doctors = await fetchDoctors(clinic.id);
        // console.log("heehah II", doctors);

        let ratio = 0;
        if (doctors.length > 0) {
          ratio = arrivals.length / doctors.length;
        }
        clinicNames.push(clinic.name);
        ratios.push(parseInt(ratio, 10));
        console.log(ratios, clinicNames);
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

      console.log(data);

      setChartData(data);
    };

    fetchData();
    console.log(chartData);
  }, []);

  return (
    <div style={height}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ClinicRatioChart;
