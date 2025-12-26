import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ reviews, data }) {
  // If data prop is provided (for dashboard), use it directly
  if (data) {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage =
                total > 0 ? Math.round((value / total) * 100) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    };

    return (
      <div style={{ width: "100%", height: "100%" }}>
        <Pie data={data} options={options} />
      </div>
    );
  }

  // Otherwise use reviews prop (for reviews/ratings)
  const labels = ["5★", "4★", "3★", "2★", "1★"];
  const values = [
    reviews?.[5] || 0,
    reviews?.[4] || 0,
    reviews?.[3] || 0,
    reviews?.[2] || 0,
    reviews?.[1] || 0,
  ];

  const reviewData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "rgba(75, 192, 192, 0.7)", // 5 star
          "rgba(54, 162, 235, 0.7)", // 4 star
          "rgba(255, 205, 86, 0.7)", // 3 star
          "rgba(255, 159, 64, 0.7)", // 2 star
          "rgba(255, 99, 132, 0.7)", // 1 star
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Pie data={reviewData} options={options} />
    </div>
  );
}

export default PieChart;
