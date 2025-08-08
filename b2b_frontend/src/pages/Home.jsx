import React, { useEffect, useState } from "react";
import CountCard from "../components/home/CountCard";
import Axios from "../utils/axios";
import SummaryApi from "../common/Summaryapi";
import {
  MdChatBubble,
  MdMessage,
  MdOutlineMessage,
  MdPerson,
} from "react-icons/md";
import { FiInbox } from "react-icons/fi";
import { TbMessage2Down, TbMessageMinus, TbMessageUp } from "react-icons/tb";
import PageHeader from "../components/utils/PageHeader";
import ReactApexChart from "react-apexcharts";

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState("");
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const chartOptions = {
    chart: {
      type: "area",
      height: 350,
      zoom: { enabled: true },
    },
    title: {
      text: "Messages Performance",
      align: "left",
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      title: { text: "Messages Count" },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    colors: ["#008FFB", "#00E396"],
    stroke: {
      curve: "smooth",
    },
  };

  const chartSeries = [
    {
      name: "Incoming Messages",
      data: chartData.incomingMessages || Array(12).fill(0),
    },
    {
      name: "Outgoing Messages",
      data: chartData.outgoingMessages || Array(12).fill(0),
    },
  ];

  // Fetch count data from backend
  const getCount = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.get_count,
      });

      if (response.data) {
        setDisplayCount(response.data.database_counts);
      }
    } catch (error) {
      console.error("Error fetching count data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch chart data from backend
  const getChartData = async () => {
    try {
      setChartLoading(true);
      const response = await Axios({
        ...SummaryApi.get_messages_count, // You'll need to add this to your SummaryApi
      });

      if (response.data && response.data.success) {
        setChartData(response.data.chart_data);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    getCount();
    getChartData();
  }, []);

  return (
    <div>
      <PageHeader title={"Home"} />
      <h2 className="mb-2 mt-2 text-xl">Statistics</h2>
      <div className="grid grid-cols-12 gap-6">
        <CountCard
          title={"Users"}
          count={displayCount?.users_count}
          icon={<MdPerson size={25} className="text-white" />}
        />
        <CountCard
          title={"In Messages"}
          count={displayCount?.welcome_messages_count}
          icon={<TbMessage2Down size={25} className="text-white" />}
        />
        <CountCard
          title={"Out Messages"}
          count={displayCount?.reply_messages_count}
          icon={<TbMessageUp size={25} className="text-white" />}
        />
        <CountCard
          title={"Templates"}
          count={displayCount?.templates_count}
          icon={<MdChatBubble size={25} className="text-white" />}
        />
      </div>
      
      <h2 className="mb-2 mt-6 text-xl">Messages Performance</h2>
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        {chartLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-lg">Loading chart data...</div>
          </div>
        ) : (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={350}
          />
        )}
      </div>
    </div>
  );
};

export default Home;