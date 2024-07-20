import React from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "@mui/material/styles";

const AverageTimeChart = ({
  height,
  chartType,
  topDoctors,
  maxAverageTime,
}) => {
  const theme = useTheme();

  const label =
    chartType === "meeting"
      ? "Average Meeting Time (mins)"
      : chartType === "waiting"
      ? "Average Waiting Time (mins)"
      : "";

  const topColor =
    chartType === "meeting"
      ? "green"
      : chartType === "waiting"
      ? "red"
      : theme.palette.primary.main;

  const data = React.useMemo(
    () => ({
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
          barPercentage: 0.8,
          borderRadius: 40,
        },
      ],
    }),
    [
      topDoctors,
      maxAverageTime,
      topColor,
      label,
      theme.palette.primary.main,
      theme.palette.primary.dark,
    ]
  );

  const options = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      scales: {
        x: {
          display: true,
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: (value) =>
              Number.isInteger(value) ? `${value} mins` : null,
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          display: true,
          grid: { display: false },
          ticks: {
            autoSkip: false,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || "";
              if (label) label += ": ";
              if (context.parsed.x !== null)
                label += `${context.parsed.x} mins`;
              return label;
            },
          },
        },
      },
      elements: { point: { radius: 5 } },
    }),
    []
  );

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default AverageTimeChart;
