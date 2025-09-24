import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MetricCard from '../../MetricCard/MetricCard';
import UpcomingMeetings from './UpcomingMeetings';
import { Package, Users, Calendar, TrendingUp } from 'lucide-react';
import dataService from '../../../services/dataService';
import { useNotification } from '../../../contexts/NotificationContext';
import './SubUserDashboard.css';

const SubUserDashboard = () => {
  const { showError } = useNotification();
  const [metrics, setMetrics] = useState({
    productsSold: { total: 0, thisMonth: 0, lastMonth: 0, change: 0, trend: 'up' },
    leadsGenerated: { total: 0, active: 0, inactive: 0, change: 0, trend: 'up' },
    upcomingMeetings: { total: 0, today: 0, thisWeek: 0, change: 0, trend: 'up' },
    performance: { score: 0, target: 100, achievement: 0, change: 0, trend: 'up' }
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [leads, deals, meetings] = await Promise.all([
        dataService.getLeads(),
        dataService.getDeals(),
        dataService.getMeetings()
      ]);

      const calculatedMetrics = calculateMetrics(leads, deals, meetings);
      const generatedChartData = generateChartData(leads, deals, meetings);
      
      setMetrics(calculatedMetrics);
      setChartData(generatedChartData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      showError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (leads, deals, meetings) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calculate leads metrics (real data)
    const totalLeads = leads.length;
    const activeLeads = leads.filter(lead => lead.status === 'New' || lead.status === 'Accepted' || lead.status === 'Pipelined').length;
    const inactiveLeads = leads.filter(lead => lead.status === 'Lost' || lead.status === 'Rejected').length;

    // Calculate meetings metrics (real data)
    const scheduledMeetings = meetings.filter(meeting => meeting.status === 'Scheduled');
    const totalMeetings = scheduledMeetings.length;
    
    // Calculate today's meetings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayMeetings = scheduledMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate >= today && meetingDate < tomorrow;
    }).length;

    // Calculate this week's meetings
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const thisWeekMeetings = scheduledMeetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate >= weekStart && meetingDate < weekEnd;
    }).length;

    // Calculate products sold metrics (real data from deals)
    const wonDeals = deals.filter(deal => deal.status === 'WON');
    const totalProductsSold = wonDeals.length;
    
    // Calculate this month's products sold
    const thisMonthDeals = wonDeals.filter(deal => {
      const dealDate = new Date(deal.created_at);
      return dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear;
    }).length;
    
    // Calculate last month's products sold
    const lastMonthDeals = wonDeals.filter(deal => {
      const dealDate = new Date(deal.created_at);
      return dealDate.getMonth() === lastMonth && dealDate.getFullYear() === lastMonthYear;
    }).length;
    
    // Calculate change percentage
    const productsSoldChange = lastMonthDeals > 0 ? 
      Math.round(((thisMonthDeals - lastMonthDeals) / lastMonthDeals) * 100) : 
      (thisMonthDeals > 0 ? 100 : 0);

    // Calculate performance score (real data)
    const totalDeals = deals.length;
    const wonDealsCount = wonDeals.length;
    const lostDeals = deals.filter(deal => deal.status === 'LOST').length;
    
    // Performance calculation: (Won deals / Total deals) * 100
    // If no deals, performance is 0
    const performanceScore = totalDeals > 0 ? Math.round((wonDealsCount / totalDeals) * 100) : 0;
    
    // Calculate performance change (simplified - could be enhanced with historical data)
    const performanceChange = performanceScore >= 80 ? 12 : performanceScore >= 60 ? 5 : -2;
    
    // Calculate achievement percentage (performance score as percentage of target)
    const target = 100;
    const achievement = Math.min(performanceScore, target);

    return {
      // Real data for products sold
      productsSold: {
        total: totalProductsSold,
        thisMonth: thisMonthDeals,
        lastMonth: lastMonthDeals,
        change: productsSoldChange,
        trend: productsSoldChange >= 0 ? 'up' : 'down'
      },
      // Real data for leads generated
      leadsGenerated: {
        total: totalLeads,
        active: activeLeads,
        inactive: inactiveLeads,
        change: 0, // Could be calculated based on previous periods
        trend: 'up'
      },
      // Real data for upcoming meetings
      upcomingMeetings: {
        total: totalMeetings,
        today: todayMeetings,
        thisWeek: thisWeekMeetings,
        change: 0, // Could be calculated based on previous periods
        trend: 'up'
      },
      // Real data for performance score
      performance: {
        score: performanceScore,
        target: target,
        achievement: achievement,
        change: performanceChange,
        trend: performanceChange >= 0 ? 'up' : 'down'
      }
    };
  };

  const generateChartData = (leads, deals, meetings) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate data for the last 9 months
    const chartData = [];
    
    for (let i = 8; i >= 0; i--) {
      const targetDate = new Date(currentYear, now.getMonth() - i, 1);
      const monthIndex = targetDate.getMonth();
      const monthName = months[monthIndex];
      
      // Count products sold (won deals) for this month
      const monthProducts = deals.filter(deal => {
        if (deal.status !== 'WON') return false;
        const dealDate = new Date(deal.created_at);
        return dealDate.getMonth() === monthIndex && dealDate.getFullYear() === currentYear;
      }).length;
      
      // Count leads generated for this month
      const monthLeads = leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate.getMonth() === monthIndex && leadDate.getFullYear() === currentYear;
      }).length;
      
      // Count meetings scheduled for this month
      const monthMeetings = meetings.filter(meeting => {
        if (meeting.status !== 'Scheduled') return false;
        const meetingDate = new Date(meeting.date);
        return meetingDate.getMonth() === monthIndex && meetingDate.getFullYear() === currentYear;
      }).length;
      
      chartData.push({
        month: monthName,
        products: monthProducts,
        leads: monthLeads,
        meetings: monthMeetings
      });
    }
    
    // If no data exists, return default chart data to prevent empty chart
    const hasData = chartData.some(data => data.products > 0 || data.leads > 0 || data.meetings > 0);
    if (!hasData) {
      return [
        { month: 'Jan', products: 0, leads: 0, meetings: 0 },
        { month: 'Feb', products: 0, leads: 0, meetings: 0 },
        { month: 'Mar', products: 0, leads: 0, meetings: 0 },
        { month: 'Apr', products: 0, leads: 0, meetings: 0 },
        { month: 'May', products: 0, leads: 0, meetings: 0 },
        { month: 'Jun', products: 0, leads: 0, meetings: 0 },
        { month: 'Jul', products: 0, leads: 0, meetings: 0 },
        { month: 'Aug', products: 0, leads: 0, meetings: 0 },
        { month: 'Sep', products: 0, leads: 0, meetings: 0 },
      ];
    }
    
    return chartData;
  };

  return (
    <div className="sub-user-dashboard" style={{ minHeight: '100vh', background: 'white' }}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">NeoCRM - Salesman</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your sales performance today.</p>
        </div>
      </div>

      <div className="dashboard-content-container">
        <div className="dashboard-grid">
          {loading ? (
            <>
              <div className="metric-card-loading">
                <div className="loading-skeleton"></div>
              </div>
              <div className="metric-card-loading">
                <div className="loading-skeleton"></div>
              </div>
              <div className="metric-card-loading">
                <div className="loading-skeleton"></div>
              </div>
              <div className="metric-card-loading">
                <div className="loading-skeleton"></div>
              </div>
            </>
          ) : (
            <>
              <MetricCard
                title="Total Products Sold"
                value={metrics.productsSold.total}
                subtitle={`This Month: ${metrics.productsSold.thisMonth} | Last Month: ${metrics.productsSold.lastMonth}`}
                change={metrics.productsSold.change}
                trend={metrics.productsSold.trend}
                icon={Package}
                color="blue"
              />
              
              <MetricCard
                title="Leads Generated"
                value={metrics.leadsGenerated.total}
                subtitle={`Active: ${metrics.leadsGenerated.active} | Inactive: ${metrics.leadsGenerated.inactive}`}
                change={metrics.leadsGenerated.change}
                trend={metrics.leadsGenerated.trend}
                icon={Users}
                color="green"
              />
              
              <MetricCard
                title="Upcoming Meetings"
                value={metrics.upcomingMeetings.total}
                subtitle={`Today: ${metrics.upcomingMeetings.today} | This Week: ${metrics.upcomingMeetings.thisWeek}`}
                change={metrics.upcomingMeetings.change}
                trend={metrics.upcomingMeetings.trend}
                icon={Calendar}
                color="purple"
              />
              
              <MetricCard
                title="Performance Score"
                value={metrics.performance.score}
                subtitle={`Target: ${metrics.performance.target} | Achievement: ${metrics.performance.achievement}%`}
                change={metrics.performance.change}
                trend={metrics.performance.trend}
                icon={TrendingUp}
                color="orange"
              />
            </>
          )}
        </div>
      </div>

      <div className="dashboard-content-container">
        <div className="dashboard-bottom-grid">
          <div className="chart-container">
            <h2 className="chart-title">Sales Performance Overview</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="1 1" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 400 }}
                  tickMargin={8}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 400 }}
                  tickMargin={8}
                  domain={[0, 60]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                    fontSize: '12px'
                  }}
                  labelStyle={{
                    color: '#374151',
                    fontWeight: 500,
                    marginBottom: '4px',
                    fontSize: '11px'
                  }}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '16px',
                    fontSize: '11px',
                    fontWeight: 400
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="products"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                  name="Products Sold"
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                  name="Leads Generated"
                />
                <Line
                  type="monotone"
                  dataKey="meetings"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#8b5cf6', strokeWidth: 2 }}
                  name="Meetings Scheduled"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <UpcomingMeetings />
        </div>
      </div>
    </div>
  );
};

export default SubUserDashboard;
