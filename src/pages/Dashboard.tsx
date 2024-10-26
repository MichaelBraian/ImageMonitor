import React from 'react';
import { 
  Users, 
  Image as ImageIcon, 
  Calendar, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function Dashboard() {
  const stats = [
    {
      label: 'Total Patients',
      value: '2,847',
      icon: Users,
      change: 12.5,
      increasing: true
    },
    {
      label: 'Images Stored',
      value: '15,329',
      icon: ImageIcon,
      change: 8.2,
      increasing: true
    },
    {
      label: 'Appointments Today',
      value: '24',
      icon: Calendar,
      change: -3.1,
      increasing: false
    },
    {
      label: 'Avg. Processing Time',
      value: '2.4m',
      icon: Clock,
      change: -12.5,
      increasing: true
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className={`flex items-center ${
                stat.increasing ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="text-sm font-medium">
                  {Math.abs(stat.change)}%
                </span>
                {stat.increasing ? (
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 ml-1" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Add more dashboard content here */}
    </div>
  );
}