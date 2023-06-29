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
import LineChart from './components/LineChart';
import MultiLineChart from './components/MultiLineChart';

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

function App() {
  const [data, setData] = useState<IStats[]>([]);

  const [total, setTotal] = useState<IStats[]>([]);
  const [module1, setModule1] = useState<IStats[]>([]);
  const [module2, setModule2] = useState<IStats[]>([]);

  useEffect(() => {
    axios('http://localhost:3333/stats').then(result => {
      setData(result.data.message);
    });
  }, []);

  useEffect(() => {
    setTotal(data.filter(entry => entry.channelName === "AC" && entry.fieldName === "P_AC"));
    setModule1(data.filter(entry => entry.channelName === "WEST" && entry.fieldName === "P_DC"));
    setModule2(data.filter(entry => entry.channelName === "EAST" && entry.fieldName === "P_DC"));
  }, [data]);

  return (
    <>
      <LineChart title="Total" values={total} color={[255, 99, 132]}/>
      <LineChart title="Channel 1" values={module1} color={[28, 161, 255]}/>
      <LineChart title="Channel 2" values={module2} color={[28, 161, 255]} />
      <MultiLineChart title="test" valueSets={[total, module1, module2]}/>
    </>
  )
}

export default App;