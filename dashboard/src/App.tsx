import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './App.css'
import IStats from "./models/IStats";
import IModule from "./models/IModule";
import LineChart from './components/LineChart';

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const colorSets = [
  [255, 99, 132],
  [28, 161, 255]
];

function App() {
  const [data, setData] = useState<IStats[]>([]);

  const [total, setTotal] = useState<IStats[]>([]);
  const [modules, setModules] = useState<IModule[]>([]);

  useEffect(() => {
    axios('http://localhost:3333/stats').then(result => {
      setData(result.data.message);
    });
  }, []);

  useEffect(() => {
    const channelNames = data.map(entry => entry.channelName).filter((value, index, self) => value !== null && value !== "AC" && self.indexOf(value) === index);
    setTotal(data.filter(entry => entry.channelName === "AC" && entry.fieldName === "P_AC"));
    setModules(channelNames.map(channelName => {
      return {
        channelName: channelName,
        stats: data.filter(entry => entry.channelName === channelName && entry.fieldName === "P_DC")
      };
    }));
  }, [data]);

  return (
    <>
      <LineChart title="Total" values={total} color={colorSets[0]}/>
      {modules.map((module, index) => <LineChart key={`line-chart-${index}`} title={module.channelName} values={module.stats} color={colorSets[1]}/> )}
    </>
  )
}

export default App;
