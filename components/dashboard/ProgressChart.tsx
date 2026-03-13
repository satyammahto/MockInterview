import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressData {
  date: string;
  score: number;
  role: string;
}

interface ProgressChartProps {
  data: ProgressData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface/30 rounded-xl border border-dashed border-border p-6 min-h-[300px]">
        <div className="text-center">
          <p className="text-sm font-bold text-muted-foreground mb-1">No Progress Data</p>
          <p className="text-xs text-muted-foreground/60">Complete an interview to see your score trend here.</p>
        </div>
      </div>
    );
  }

  // Ensure data is sorted by date chronologically if not already
  // Formatter for Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0E1220] border border-[#1E2535] p-3 rounded-xl shadow-xl">
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{label}</p>
          <p className="text-xs text-foreground font-semibold mb-2">{payload[0].payload.role}</p>
          <p className="text-accent font-heading text-lg font-bold">
            {payload[0].value} <span className="text-[10px] text-muted-foreground">Score</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: -20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2535" opacity={0.6} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8892A4', fontSize: 11 }}
            dy={15}
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8892A4', fontSize: 11 }}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#4EFFA3"
            strokeWidth={3}
            dot={{ fill: '#0E1220', stroke: '#4EFFA3', strokeWidth: 2, r: 4 }}
            activeDot={{ fill: '#4EFFA3', stroke: '#0E1220', strokeWidth: 2, r: 6 }}
            animationDuration={1500}
            // Add a slight gradient shadow effect under the line via drop-shadow in an ideal CSS world, but Recharts SVG filters can be complex.
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
