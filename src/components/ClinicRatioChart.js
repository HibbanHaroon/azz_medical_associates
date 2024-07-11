import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchAllArrivals } from "../services/arrivalsService";
import { fetchDoctors } from "../services/doctorService";
import { getAllClinics } from "../services/clinicService";

const ClinicRatioChart = () => {
  const [chartData, setChartData] = useState({ datasets: [] });

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
            backgroundColor: ["rgba(75, 192, 192, 0.6)"],
            borderColor: ["rgba(75, 192, 192, 1)"],
            borderWidth: 1,
            tension: 0.4,
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
    <div style={{ height: "200px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ClinicRatioChart;
