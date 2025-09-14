import { Table } from 'antd';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Compass,
  CreditCard,
  DollarSign,
  Mountain,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// Mock data for the dashboard
const mockData = {
  totalRevenue: 124580,
  totalUsers: 2845,
  activeAdventures: 48,
  totalBookings: 1256,
  revenueIncrease: 14.5,
  userIncrease: 7.2,
  adventureIncrease: 4.8,
  bookingIncrease: 12.3,
  recentBookings: [
    {
      id: 'B-1234',
      user: 'John Doe',
      adventure: 'Mountain Climbing',
      date: '2025-02-24',
      amount: 450,
    },
    {
      id: 'B-1235',
      user: 'Jane Smith',
      adventure: 'Scuba Diving',
      date: '2025-02-23',
      amount: 350,
    },
    {
      id: 'B-1236',
      user: 'Mike Johnson',
      adventure: 'Sky Diving',
      date: '2025-02-22',
      amount: 550,
    },
    {
      id: 'B-1237',
      user: 'Sarah Williams',
      adventure: 'River Rafting',
      date: '2025-02-21',
      amount: 300,
    },
    {
      id: 'B-1238',
      user: 'David Brown',
      adventure: 'Bungee Jumping',
      date: '2025-02-20',
      amount: 250,
    },
  ],
  topAdventures: [
    { name: 'Sky Diving', bookings: 245, revenue: 36750 },
    { name: 'Scuba Diving', bookings: 198, revenue: 29700 },
    { name: 'Mountain Climbing', bookings: 156, revenue: 23400 },
    { name: 'Bungee Jumping', bookings: 132, revenue: 19800 },
    { name: 'River Rafting', bookings: 124, revenue: 18600 },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 9200 },
    { month: 'Mar', revenue: 10500 },
    { month: 'Apr', revenue: 9800 },
    { month: 'May', revenue: 11200 },
    { month: 'Jun', revenue: 12500 },
    { month: 'Jul', revenue: 13800 },
    { month: 'Aug', revenue: 14200 },
    { month: 'Sep', revenue: 13500 },
    { month: 'Oct', revenue: 12800 },
    { month: 'Nov', revenue: 11500 },
    { month: 'Dec', revenue: 10800 },
  ],
};
const columns = [
  {
    title: 'Booking ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'User',
    dataIndex: 'user',
    key: 'user',
  },
  {
    title: 'Adventure',
    dataIndex: 'adventure',
    key: 'adventure',
  },
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    key: 'amount',
  },
];
export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockData.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span
                className={`flex items-center ${
                  mockData.revenueIncrease > 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {mockData.revenueIncrease > 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(mockData.revenueIncrease)}%
              </span>
              <span>from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span
                className={`flex items-center ${
                  mockData.userIncrease > 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {mockData.userIncrease > 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(mockData.userIncrease)}%
              </span>
              <span>from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Adventures
            </CardTitle>
            <Mountain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.activeAdventures}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span
                className={`flex items-center ${
                  mockData.adventureIncrease > 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {mockData.adventureIncrease > 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(mockData.adventureIncrease)}%
              </span>
              <span>from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockData.totalBookings.toLocaleString()}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span
                className={`flex items-center ${
                  mockData.bookingIncrease > 0
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {mockData.bookingIncrease > 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {Math.abs(mockData.bookingIncrease)}%
              </span>
              <span>from last {timeRange}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue for the current year
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <RevenueChart data={mockData.monthlyRevenue} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Adventures</CardTitle>
            <CardDescription>
              Most popular adventures by bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.topAdventures.map((adventure, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-[45px] text-center">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                  </div>
                  <div className="ml-2 flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {adventure?.name}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>{adventure.bookings} bookings</span>
                      <span className="mx-2">•</span>
                      <span>${adventure.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                  <div
                    className={`h-2 w-[${Math.max(
                      adventure.bookings / 3,
                      30
                    )}px] bg-primary rounded-full`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col">
        <Card className="md:col-span-2 col-span-1">
          <Table
            className="w-full"
            columns={columns}
            dataSource={mockData.recentBookings}
          />
        </Card>

        <Card className="col-span-1 md:col-span-1 mt-5">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full p-1 bg-green-100">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">
                    Avg. Booking Value
                  </span>
                </div>
                <span className="text-sm font-bold">$345</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full p-1 bg-purple-100">
                    <Compass className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Top Location</span>
                </div>
                <span className="text-sm font-bold">Alpine Heights</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <XAxis dataKey="month" stroke="#000000" />
        <YAxis stroke="#000000" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#00bfa0"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
