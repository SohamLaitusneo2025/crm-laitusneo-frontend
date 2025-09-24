import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MetricCard from '../MetricCard/MetricCard';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import dataService from '../../services/dataService';
import './Dashboard.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    leads: { 
      total: 0, 
      won: 0, 
      lost: 0, 
      pipelined: 0, 
      change: 0, 
      trend: 'up' 
    },
    upcomingDeals: { 
      count: 0, 
      value: 0, 
      change: 0, 
      trend: 'up' 
    },
    servicesSold: { 
      count: 0, 
      revenue: 0, 
      change: 0, 
      trend: 'up' 
    },
    totalServices: { 
      count: 0, 
      underMaintenance: 0, 
      working: 0, 
      rejected: 0,
      change: 0, 
      trend: 'up' 
    }
  });

  const [loading, setLoading] = useState(true);

  // Helper function to calculate metrics from real data
  const calculateMetrics = (leads, deals, products) => {
    // Calculate lead metrics
    const totalLeads = leads.length;
    const wonLeads = leads.filter(lead => lead.status === 'Won').length;
    const lostLeads = leads.filter(lead => lead.status === 'Lost').length;
    const pipelinedLeads = leads.filter(lead => lead.status === 'Pipelined').length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;

    // Calculate deal metrics (upcoming deals = new leads)
    const upcomingDealsCount = newLeads;
    const upcomingDealsValue = leads
      .filter(lead => lead.status === 'New')
      .reduce((sum, lead) => sum + (parseFloat(lead.value) || 0), 0);

    // Calculate services sold (won deals)
    const wonDeals = deals.filter(deal => deal.status === 'WON');
    const servicesSoldCount = wonDeals.length;
    const servicesSoldRevenue = wonDeals.reduce((sum, deal) => sum + (parseFloat(deal.price) || 0), 0);

    // Calculate total services (products)
    const totalServicesCount = products.length;
    const workingServices = products.filter(product => product.status === 'working').length;
    const underMaintenanceServices = products.filter(product => product.status === 'under_maintenance').length;
    const rejectedServices = products.filter(product => product.status === 'rejected').length;

    return {
      leads: {
        total: totalLeads,
        won: wonLeads,
        lost: lostLeads,
        pipelined: pipelinedLeads,
        change: 0, // Could be calculated by comparing with previous period
        trend: 'up'
      },
      upcomingDeals: {
        count: upcomingDealsCount,
        value: upcomingDealsValue,
        change: 0,
        trend: 'up'
      },
      servicesSold: {
        count: servicesSoldCount,
        revenue: servicesSoldRevenue,
        change: 0,
        trend: 'up'
      },
      totalServices: {
        count: totalServicesCount,
        underMaintenance: underMaintenanceServices,
        working: workingServices,
        rejected: rejectedServices,
        change: 0,
        trend: 'up'
      }
    };
  };

  // Fetch data for cards only
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);

        // Fetch all required data
        const [leads, deals, products] = await Promise.all([
          dataService.getLeads(),
          dataService.getDeals(),
          dataService.getProducts()
        ]);

        // Calculate metrics
        const calculatedMetrics = calculateMetrics(leads, deals, products);
        setMetrics(calculatedMetrics);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, []);

  const chartData = [
    { month: 'Jan', sales: 4000, leads: 2400, deals: 2100 },
    { month: 'Feb', sales: 3000, leads: 1398, deals: 2200 },
    { month: 'Mar', sales: 2000, leads: 9800, deals: 2290 },
    { month: 'Apr', sales: 2780, leads: 3908, deals: 2000 },
    { month: 'May', sales: 1890, leads: 4800, deals: 2181 },
    { month: 'Jun', sales: 2390, leads: 3800, deals: 2500 },
    { month: 'Jul', sales: 3490, leads: 4300, deals: 2100 },
    { month: 'Aug', sales: 4200, leads: 3200, deals: 2800 },
    { month: 'Sep', sales: 3800, leads: 4100, deals: 2900 },
  ];


  return (
    <div className="dashboard" style={{ minHeight: '100vh', background: 'white' }}>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">NeoCRM</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your business today.</p>
        </div>
      </div>

      <div className="dashboard-content-container">
        <div className="dashboard-grid">
          {loading ? (
            // Show loading placeholders for cards
            <>
              <div className="metric-card-loading">Loading...</div>
              <div className="metric-card-loading">Loading...</div>
              <div className="metric-card-loading">Loading...</div>
              <div className="metric-card-loading">Loading...</div>
            </>
          ) : (
            // Show real data cards
            <>
          <MetricCard
            title="Total Leads"
            value={metrics.leads.total}
            subtitle={`Won: ${metrics.leads.won} | Lost: ${metrics.leads.lost} | Pipelined: ${metrics.leads.pipelined}`}
            change={metrics.leads.change}
            trend={metrics.leads.trend}
            icon={Users}
            color="blue"
          />
          
          <MetricCard
            title="Upcoming Deals"
            value={metrics.upcomingDeals.count}
            subtitle={`₹${metrics.upcomingDeals.value.toLocaleString('en-IN')} value`}
            change={metrics.upcomingDeals.change}
            trend={metrics.upcomingDeals.trend}
            icon={TrendingUp}
            color="green"
          />
          
          <MetricCard
            title="Services Sold"
            value={metrics.servicesSold.count}
            subtitle={`Revenue: ₹${metrics.servicesSold.revenue.toLocaleString('en-IN')}`}
            change={metrics.servicesSold.change}
            trend={metrics.servicesSold.trend}
            icon={ShoppingCart}
            color="purple"
          />
          
          <MetricCard
            title="Total Services"
            value={metrics.totalServices.count}
            subtitle={`Working: ${metrics.totalServices.working} | Under Maintenance: ${metrics.totalServices.underMaintenance} | Rejected: ${metrics.totalServices.rejected}`}
            change={metrics.totalServices.change}
            trend={metrics.totalServices.trend}
            icon={Package}
            color="orange"
          />
            </>
          )}
        </div>
      </div>

      <div className="dashboard-content-container">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                name="Sales (₹)"
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                name="Leads Generated"
              />
              <Line 
                type="monotone" 
                dataKey="deals" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                name="Deals Closed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
