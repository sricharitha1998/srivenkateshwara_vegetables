import React from 'react';
import { Pie } from 'react-chartjs-2';

import Chart from 'chart.js/auto';

import {CategoryScale} from 'chart.js'; 
Chart.register(CategoryScale);

const PieChart = () => {

    const data={
        labels: [
            "Desktops",
            "Tablets"
        ],
        datasets: [
            {
                data: [300, 180],
                backgroundColor: ["#34c38f", "#ebeff2"],
                hoverBackgroundColor: ["#34c38f","#ebeff2"],
                hoverBorderColor: "#fff"
            }]
    },
    option= {
        plugins: {
            legend: {
                labels: {
                    font: {
                        family: 'Poppins',
                    }
                }
            },
        }
    }
  return (
    <React.Fragment>
        <Pie width={260} height={260} data={data} options={option}className="chartjs-chart mx-auto" />
    </React.Fragment>
  )
}

export default PieChart;
