import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTheme } from "@mui/material/styles";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ValuableProvidersPieChart = ({ data }) => {
  const theme = useTheme();

  // Function to generate gradient colors from dark blue to light blue
  const generateGradientColors = (startColor, endColor, steps) => {
    const start = parseInt(startColor.slice(1), 16);
    const end = parseInt(endColor.slice(1), 16);

    const startRGB = {
      r: (start >> 16) & 0xff,
      g: (start >> 8) & 0xff,
      b: start & 0xff,
    };
    const endRGB = {
      r: (end >> 16) & 0xff,
      g: (end >> 8) & 0xff,
      b: end & 0xff,
    };

    const stepRGB = {
      r: (endRGB.r - startRGB.r) / steps,
      g: (endRGB.g - startRGB.g) / steps,
      b: (endRGB.b - startRGB.b) / steps,
    };

    const colors = [];
    for (let i = 0; i < steps; i++) {
      colors.push(
        `rgb(${Math.round(startRGB.r + stepRGB.r * i)}, ${Math.round(
          startRGB.g + stepRGB.g * i
        )}, ${Math.round(startRGB.b + stepRGB.b * i)})`
      );
    }

    return colors;
  };

  const calculateLuminance = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const gradientColors = generateGradientColors(
    theme.palette.primary.main,
    "#EAF4FD",
    sortedData.length
  );

  const textColors = gradientColors.map((color) => {
    return calculateLuminance(color) > 150 ? "#000000" : "#FFFFFF";
  });

  const chartData = {
    labels: sortedData.map((item) => item.name),
    datasets: [
      {
        data: sortedData.map((item) => item.count),
        backgroundColor: gradientColors,
        hoverBackgroundColor: gradientColors,
        datalabels: {
          color: textColors,
          formatter: (value) => value, // Display the count value
          font: {
            weight: "bold",
          },
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.raw !== null) {
              label += context.raw;
            }
            return label;
          },
        },
      },
      legend: {
        display: true,
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
      datalabels: {
        anchor: "center", // Center the labels
        align: "center", // Center the labels
        font: {
          weight: "bold",
          size: 12,
        },
        color: function (context) {
          return textColors[context.dataIndex];
        },
      },
    },
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      {data.length > 0 ? (
        <Pie data={chartData} options={options} />
      ) : (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          No patients for this clinic or all clinics.
        </div>
      )}
    </div>
  );
};

export default ValuableProvidersPieChart;
