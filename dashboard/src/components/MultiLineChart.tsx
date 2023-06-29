import { FC } from "react";
import { Line } from 'react-chartjs-2';
import IStats from '../models/IStats';
import type { ChartOptions, ChartData } from 'chart.js';
import moment from "moment";

interface MultiLineChartProps {
    valueSets: IStats[][]
    title: string;
}

const MultiLineChart: FC<MultiLineChartProps> = (props) => {
    const {title, valueSets} = props;

    const colors = [
      [255, 99, 132],
      [28, 161, 255],
      [110, 206, 120]
    ];
    
    const datasets = valueSets.map((valueSet, index) => {
      return {
        label: valueSet[0]? valueSet[0].channelName : "",
        labels: valueSet.map(entry => moment(entry.createdAt).format("LT")),
        data: valueSet.map(entry => entry.fieldValue),
        borderColor: `rgb(${colors[index][0]}, ${colors[index][1]}, ${colors[index][2]})`,
        backgroundColor: `rgba(${colors[index][0]}, ${colors[index][1]}, ${colors[index][2]}, 0.5)`,
        yAxisID: 'y',
      };
    });

    const data: ChartData<'line'> = {
      // labels: valueSets.flatMap(valueSet => valueSet.map(entry => moment(entry.createdat).format("LT"))),
      datasets: datasets,
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

export default MultiLineChart;