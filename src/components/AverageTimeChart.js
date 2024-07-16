import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { fetchAllArrivals } from "../services/arrivalsService";
import { fetchDoctors } from "../services/doctorService";
import { getAllClinics } from "../services/clinicService";
import { useTheme } from "@mui/material/styles";

const AverageTimeChart = ({ height, isAllClinics, clinicId, chartType }) => {
  const [chartData, setChartData] = useState({ datasets: [] });
  const theme = useTheme();

  let label =
    chartType === "meeting"
      ? "Average Meeting Time (mins)"
      : chartType === "waiting"
      ? "Average Waiting Time (mins)"
      : "";

  // Determine topColor based on chartType
  let topColor =
    chartType === "meeting"
      ? "blue"
      : chartType === "waiting"
      ? "red"
      : theme.palette.primary.main;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y", // Makes the chart horizontal
    scales: {
      x: {
        display: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            if (Number.isInteger(value)) {
              return value + " mins";
            }
          },
        },
      },
      y: {
        display: true,
        grid: {
          display: false,
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
            if (context.parsed.x !== null) {
              label += context.parsed.x + " mins";
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

  function calculateMeetingTime(calledInTime, endTime) {
    return endTime !== 0 ? (endTime - calledInTime) / (1000 * 60) : 0;
  }

  function calculateWaitingTime(calledInTime, arrivalTime) {
    let diffMs = 0;
    if (calledInTime !== 0) {
      diffMs = calledInTime - arrivalTime;
    } else {
      diffMs = Date.now() - arrivalTime;
    }

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    return diffMins;
  }

  useEffect(() => {
    const fetchData = async () => {
      let clinics = [];
      if (isAllClinics) {
        clinics = await getAllClinics();
      } else {
        clinics = [{ id: clinicId }];
      }

      const doctorTimes = {};

      for (const clinic of clinics) {
        const arrivals = await fetchAllArrivals(clinic.id);
        const doctors = await fetchDoctors(clinic.id);

        for (const doctor of doctors) {
          if (!doctorTimes[doctor.name]) {
            doctorTimes[doctor.name] = { totalTime: 0, count: 0 };
          }

          const doctorArrivals = arrivals.filter(
            (arrival) => arrival.doctorID === doctor.id
          );

          for (const arrival of doctorArrivals) {
            const calledInTime = new Date(arrival.calledInTime).getTime();
            const arrivalTime = new Date(arrival.arrivalTime).getTime();
            const endTime = new Date(arrival.endTime).getTime();
            let time = 0;
            if (chartType === "meeting") {
              time = calculateMeetingTime(calledInTime, endTime);
            } else if (chartType === "waiting") {
              time = calculateWaitingTime(calledInTime, arrivalTime);
            }

            doctorTimes[doctor.name].totalTime += time;
            doctorTimes[doctor.name].count += 1;
          }
        }
      }

      const doctorNames = Object.keys(doctorTimes);
      const averageTimes = doctorNames.map((name) => ({
        name,
        averageTime:
          doctorTimes[name].count !== 0
            ? Math.round(doctorTimes[name].totalTime / doctorTimes[name].count)
            : 0,
      }));

      // Sort by average meeting time in descending order and take top 6
      const topDoctors = averageTimes
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, 6);

      // Find the maximum average time
      const maxAverageTime = Math.max(
        ...topDoctors.map((doctor) => doctor.averageTime)
      );

      const data = {
        labels: topDoctors.map((doctor) => doctor.name),
        datasets: [
          {
            label: label,
            data: topDoctors.map((doctor) => doctor.averageTime),
            backgroundColor: topDoctors.map((doctor) =>
              doctor.averageTime === maxAverageTime
                ? topColor
                : theme.palette.primary.main
            ),
            borderColor: theme.palette.primary.dark,
            borderWidth: 0,
            barThickness: 10,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            borderRadius: 40,
          },
        ],
      };

      setChartData(data);
    };

    fetchData();
  }, [isAllClinics, clinicId, chartType, theme]);

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default AverageTimeChart;
