import { FC } from "react";
import { Line } from 'react-chartjs-2';
import IStats from '../models/IStats';
import moment from "moment";
import type { ChartOptions } from 'chart.js';

interface LineChartProps {
    values: IStats[]
    title: string;
    color: number[];
}

const LineChart: FC<LineChartProps> = (props) => {
    const {title, color, values} = props;

    const labels = values.map(entry => moment(entry.createdAt).format("LT"));

    const data = {
        labels,
        datasets: [
            {
                label: 'Watt',
                data: values.map(entry => entry.fieldValue),
                borderColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`,
                yAxisID: 'y',
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            title: {
                display: true,
                text: title,
            },
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
            },
        },
    };

    return <Line options={options} data={data} />;
};

export default LineChart;