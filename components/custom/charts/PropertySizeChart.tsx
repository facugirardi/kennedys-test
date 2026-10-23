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

type SizeDatum = { k: string; v: number }

export default function PropertySizeChart({ data }: { data: SizeDatum[] }) {
  const labels = data.map(d => d.k)
  const values = data.map(d => d.v)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of listings',
        data: values,
        backgroundColor: '#F5A546',
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
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
      title: { display: true, text: 'PROPERTY SIZE', color: '#172338', font: { family: 'GT Super Ds Trial', size: 16, weight: '300' }, padding: { bottom: 12 } },
      tooltip: {
        callbacks: {
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
      <div className="h-[240px] sm:h-[260px] md:h-[280px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}


