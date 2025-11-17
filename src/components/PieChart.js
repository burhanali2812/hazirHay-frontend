import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({reviews}) {
 const labels = ["5★", "4★", "3★", "2★", "1★"];
  const values = [
    reviews[5] || 0,
    reviews[4] || 0,
    reviews[3] || 0,
    reviews[2] || 0,
    reviews[1] || 0,
  ];

  const data = {
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


  return (
    <div>
      <Pie data={data} />
    </div>
  );
}

export default PieChart;
