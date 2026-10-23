import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title)

type Bucket = { r: string; v: number }

export default function OccupancyChart({ data, headline }: { data: Bucket[]; headline: string }) {
  const labels = data.map(d => d.r)
  const values = data.map(d => d.v)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of listings',
        data: values,
        backgroundColor: '#10B981',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.9,
      },
    ],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { boxWidth: 10, color: '#8C97A5', usePointStyle: true, pointStyle: 'rectRounded' },
      },
      title: { display: true, text: headline, color: '#172338', font: { family: 'GT Super Ds Trial', size: 16, weight: '300' }, padding: { bottom: 12 } },
      tooltip: {
        callbacks: {
          title: (items: any[]) => items[0]?.label ?? '',
          label: (ctx: any) => `Number of listings: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#EEF2F5', drawBorder: false },
        ticks: { color: '#6B7785', font: { size: 10 } },
      },
      y: {
        grid: { color: '#EEF2F5', drawBorder: false },
        ticks: { color: '#6B7785', font: { size: 10 } },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="bg-white rounded-[18px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] min-w-0">
      <div className="h-[360px] sm:h-[420px] md:h-[460px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}


