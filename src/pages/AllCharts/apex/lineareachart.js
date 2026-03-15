import React, { Component } from 'react';
// import ChartistGraph from 'react-chartist';
import ReactApexChart from 'react-apexcharts';

class lineareachart extends Component {
    constructor(props) {
        super(props);

        this.state = {
            series: [5, 9, 7, 8, 5, 3, 5, 4],
            options : {
                
                legend: {
                    show: true,
                },
              
              }
        }
    }
    render() {
        // var lineChartData = {
        //     labels: [1, 2, 3, 4, 5, 6, 7, 8],
        //     series: [
        //         [5, 9, 7, 8, 5, 3, 5, 4]
        //     ]
        // };
        // var lineChartOptions = {
        //     low: 0,
        //     showArea: true,
        // }
        return (
            <React.Fragment>
                {/* <ChartistGraph data={lineChartData} style={{ height: "290px" }} options={lineChartOptions} type={'Line'} /> */}
                <ReactApexChart options={this.state.options} series={this.state.series} type="line" height="290" />
            </React.Fragment>
        );
    }
}

export default lineareachart;