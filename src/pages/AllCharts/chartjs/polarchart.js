import React, { Component } from 'react';
import { PolarArea } from 'react-chartjs-2';

import Chart from 'chart.js/auto';

import {CategoryScale} from 'chart.js'; 
Chart.register(CategoryScale);

class PolarChart extends Component {

    render() {
        const data = {
            datasets: [{
                data: [
                    11,
                    16,
                    7,
                    18
                ],
                backgroundColor: [
                    "#f46a6a",
                    "#34c38f",
                    "#f1b44c",
                    "#556ee6"
                ],
                label: 'My dataset', // for legend
                hoverBorderColor: "#fff"
            }],
            labels: [
                "Series 1",
                "Series 2",
                "Series 3",
                "Series 4"
            ]
        };

        return (
            <React.Fragment>
                <PolarArea width={300} height={300} data={data} className="chartjs-chart mx-auto" />
            </React.Fragment>
        );
    }
}

export default PolarChart;