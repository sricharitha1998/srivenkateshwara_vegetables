import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';

import Chart from 'chart.js/auto';

import {CategoryScale} from 'chart.js'; 
Chart.register(CategoryScale);

class DountChart extends Component {

    render() {
        const data = {
            labels: [
                "Desktops",
                "Tablets"
            ],
            datasets: [
                {
                    data: [300, 210],
                    backgroundColor: [
                        "#556ee6",
                        "#ebeff2"
                    ],
                    hoverBackgroundColor: [
                        "#556ee6",
                        "#ebeff2"
                    ],
                    hoverBorderColor: "#fff"
                }
            ]
        };

        return (
            <React.Fragment>
                <Doughnut width={260} height={260} data={data} className="chartjs-chart mx-auto" />
            </React.Fragment>
        );
    }
}

export default DountChart;