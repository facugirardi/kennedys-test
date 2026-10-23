import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

type Segment = { label: string; pct: number; color: string }

export default function PropertyTypeDonut({ segments }: { segments: Segment[] }) {
  const data = {
    labels: segments.map(s => s.label),
    datasets: [
      {
        label: 'Share',
        data: segments.map(s => s.pct),
        backgroundColor: segments.map(s => s.color),
        borderWidth: 0,
        hoverOffset: 2,
      },
    ],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { color: '#172338', boxWidth: 10, usePointStyle: true },
      },
      title: { display: true, text: 'PROPERTY TYPE', color: '#172338', font: { family: 'GT Super Ds Trial', size: 16, weight: '300' }, padding: { bottom: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-[18px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] min-w-0">
      <div className="h-[260px] md:h-[300px]">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  )
}


