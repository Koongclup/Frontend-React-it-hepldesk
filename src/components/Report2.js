import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

const IncidentCharts = () => {
  const [incidentData, setIncidentData] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/jobnews')
      .then(response => {
        setIncidentData(response.data);
      })
      .catch(error => {
        console.error('Error fetching incident data:', error);
      });
  }, []);

  const getStatusData = () => {
    const statusCount = incidentData.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      y: count
    }));
  };

  const getStatusSeriesData = () => {
    const statusCount = incidentData.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      data: [count]
    }));
  };

  const pieOptions = {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'Incident Status Distribution'
    },
    series: [{
      name: 'Incidents',
      colorByPoint: true,
      data: getStatusData()
    }]
  };

  const columnOptions = {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Incident Status Count'
    },
    xAxis: {
      categories: ['Status']
    },
    yAxis: {
      title: {
        text: 'Count'
      }
    },
    series: getStatusSeriesData()
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={pieOptions}
      />
      <HighchartsReact
        highcharts={Highcharts}
        options={columnOptions}
      />
    </div>
  );
};

export default IncidentCharts;
