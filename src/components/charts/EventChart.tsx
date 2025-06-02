'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';

interface ChartData {
  name?: string;
  time?: string;
  value?: number;
  count?: number;
  낙상감지?: number;
  낙상예측?: number;
  욕창감지?: number;
  욕창예측?: number;
  이벤트수?: number;
  critical?: number;
  high?: number;
  medium?: number;
  low?: number;
  [key: string]: string | number | undefined;
}

interface EventChartProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area' | 'horizontal-bar';
  title?: string;
  height?: number;
}

// 색상 팔레트
const COLORS = ['#cf1322', '#fa8c16', '#faad14', '#52c41a', '#1890ff', '#722ed1', '#eb2f96'];

// 샘플 데이터들
const sampleLineData = [
  { name: '월', 낙상감지: 4, 낙상예측: 8, 욕창감지: 2, 욕창예측: 6 },
  { name: '화', 낙상감지: 3, 낙상예측: 6, 욕창감지: 3, 욕창예측: 8 },
  { name: '수', 낙상감지: 2, 낙상예측: 9, 욕창감지: 1, 욕창예측: 5 },
  { name: '목', 낙상감지: 5, 낙상예측: 7, 욕창감지: 4, 욕창예측: 7 },
  { name: '금', 낙상감지: 3, 낙상예측: 5, 욕창감지: 2, 욕창예측: 4 },
  { name: '토', 낙상감지: 1, 낙상예측: 3, 욕창감지: 1, 욕창예측: 2 },
  { name: '일', 낙상감지: 2, 낙상예측: 4, 욕창감지: 1, 욕창예측: 3 },
];

const sampleBarData = [
  { time: '00-04', 이벤트수: 2 },
  { time: '04-08', 이벤트수: 8 },
  { time: '08-12', 이벤트수: 15 },
  { time: '12-16', 이벤트수: 12 },
  { time: '16-20', 이벤트수: 18 },
  { time: '20-24', 이벤트수: 6 },
];

const samplePieData = [
  { name: '낙상 감지', value: 35, count: 12 },
  { name: '낙상 예측', value: 25, count: 8 },
  { name: '욕창 감지', value: 20, count: 7 },
  { name: '욕창 예측', value: 15, count: 5 },
  { name: '기타', value: 5, count: 2 },
];

const sampleAreaData = [
  { name: '1주차', critical: 4, high: 8, medium: 12, low: 6 },
  { name: '2주차', critical: 3, high: 6, medium: 15, low: 8 },
  { name: '3주차', critical: 2, high: 9, medium: 18, low: 5 },
  { name: '4주차', critical: 5, high: 7, medium: 14, low: 7 },
];

const sampleHorizontalBarData = [
  { name: '401호', count: 15 },
  { name: '402호', count: 12 },
  { name: '403호', count: 8 },
  { name: '405호', count: 6 },
  { name: '407호', count: 4 },
];

export default function EventChart({ data, type, title, height = 320 }: EventChartProps) {
  const getDefaultData = () => {
    switch (type) {
      case 'line': return sampleLineData;
      case 'bar': return sampleBarData;
      case 'pie': return samplePieData;
      case 'area': return sampleAreaData;
      case 'horizontal-bar': return sampleHorizontalBarData;
      default: return sampleLineData;
    }
  };

  const chartData = data.length > 0 ? data : getDefaultData();

  const renderCustomLabel = (entry: any) => {
    return `${entry.name}: ${entry.count}건 (${entry.value}%)`;
  };

  const chartStyle = { width: '100%', height };

  if (type === 'line') {
    return (
      <div className="w-full" style={{ height }}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <ResponsiveContainer {...chartStyle}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="낙상감지" 
              stroke="#cf1322" 
              strokeWidth={2}
              dot={{ fill: '#cf1322' }}
            />
            <Line 
              type="monotone" 
              dataKey="낙상예측" 
              stroke="#fa8c16" 
              strokeWidth={2}
              dot={{ fill: '#fa8c16' }}
            />
            <Line 
              type="monotone" 
              dataKey="욕창감지" 
              stroke="#f5222d" 
              strokeWidth={2}
              dot={{ fill: '#f5222d' }}
            />
            <Line 
              type="monotone" 
              dataKey="욕창예측" 
              stroke="#faad14" 
              strokeWidth={2}
              dot={{ fill: '#faad14' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="w-full" style={{ height }}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <ResponsiveContainer {...chartStyle}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="이벤트수" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="w-full" style={{ height }}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <ResponsiveContainer {...chartStyle}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}%`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'area') {
    return (
      <div className="w-full" style={{ height }}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <ResponsiveContainer {...chartStyle}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="critical" stackId="1" stroke="#cf1322" fill="#cf1322" />
            <Area type="monotone" dataKey="high" stackId="1" stroke="#fa8c16" fill="#fa8c16" />
            <Area type="monotone" dataKey="medium" stackId="1" stroke="#faad14" fill="#faad14" />
            <Area type="monotone" dataKey="low" stackId="1" stroke="#52c41a" fill="#52c41a" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'horizontal-bar') {
    return (
      <div className="w-full" style={{ height }}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <ResponsiveContainer {...chartStyle}>
          <BarChart
            layout="horizontal"
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
} 