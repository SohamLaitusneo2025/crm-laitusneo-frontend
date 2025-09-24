import React, { useState, useEffect } from 'react';
import { Download, FileText, User, Calendar, TrendingUp, Target, BarChart3, Users, DollarSign, Activity, Award, AlertCircle } from 'lucide-react';
import Modal from '../Modal/Modal';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ReportGeneration.css';

const ReportGeneration = () => {
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ 
    type: 'info', 
    title: '', 
    message: '', 
    confirmText: 'OK',
    showCancel: false,
    onConfirm: null
  });
  const [salesmen, setSalesmen] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('jwt');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch salesmen data
  const fetchSalesmen = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/salesmen`, { headers: authHeaders });
      setSalesmen(response.data?.salesmen || []);
    } catch (error) {
      console.error('Failed to fetch salesmen:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Failed to load salesmen data. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch report data for selected salesman
  const fetchReportData = async (salesmanId, startDate, endDate) => {
    try {
      setLoading(true);
      
      // Fetch leads data
      const leadsResponse = await axios.get(`${API_BASE}/leads`, { headers: authHeaders });
      const allLeads = leadsResponse.data?.leads || [];
      
      // Fetch deals data
      const dealsResponse = await axios.get(`${API_BASE}/deals`, { headers: authHeaders });
      const allDeals = dealsResponse.data?.deals || [];
      
      console.log('Raw data fetched:', {
        totalLeads: allLeads.length,
        totalDeals: allDeals.length,
        salesmanId: parseInt(salesmanId)
      });
      
      // Filter data for selected salesman and date range
      const salesmanLeads = allLeads.filter(lead => 
        lead.salesman_id === parseInt(salesmanId) &&
        (!startDate || new Date(lead.created_at) >= new Date(startDate)) &&
        (!endDate || new Date(lead.created_at) <= new Date(endDate))
      );
      
      const salesmanDeals = allDeals.filter(deal => 
        deal.salesman_id === parseInt(salesmanId) &&
        (!startDate || new Date(deal.created_at) >= new Date(startDate)) &&
        (!endDate || new Date(deal.created_at) <= new Date(endDate))
      );
      
      console.log('Filtered data:', {
        salesmanLeads: salesmanLeads.length,
        salesmanDeals: salesmanDeals.length,
        sampleDeal: salesmanDeals[0] || 'No deals found'
      });
      
      // Calculate report metrics
      const reportMetrics = calculateReportMetrics(salesmanLeads, salesmanDeals);
      
      console.log('Calculated metrics:', reportMetrics);
      
      setReportData(reportMetrics);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setModalData({
        type: 'error',
        title: 'Error',
        message: 'Failed to load report data. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse price string to number
  const parsePrice = (priceString) => {
    if (!priceString) return 0;
    // Remove currency symbols, commas, and spaces, then parse
    const cleanPrice = priceString.toString().replace(/[₹,\s]/g, '');
    const parsed = parseFloat(cleanPrice);
    const result = isNaN(parsed) ? 0 : parsed;
    
    // Debug logging for price parsing
    if (priceString && result === 0) {
      console.warn('Price parsing issue:', {
        original: priceString,
        cleaned: cleanPrice,
        parsed: parsed,
        result: result
      });
    }
    
    return result;
  };

  // Calculate comprehensive report metrics
  const calculateReportMetrics = (leads, deals) => {
    const totalLeads = leads.length;
    const totalDeals = deals.length;
    const totalRevenue = deals.reduce((sum, deal) => sum + parsePrice(deal.price), 0);
    const conversionRate = totalLeads > 0 ? (totalDeals / totalLeads) * 100 : 0;
    
    // Lead status breakdown
    const leadStatusBreakdown = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});
    
    // Deal status breakdown
    const dealStatusBreakdown = deals.reduce((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {});
    
    // Product performance
    const productPerformance = deals.reduce((acc, deal) => {
      const product = deal.productName;
      if (!acc[product]) {
        acc[product] = { sales: 0, revenue: 0 };
      }
      acc[product].sales += 1;
      acc[product].revenue += parsePrice(deal.price);
      return acc;
    }, {});
    
    // Monthly breakdown
    const monthlyBreakdown = leads.reduce((acc, lead) => {
      const month = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { leads: 0, deals: 0, revenue: 0 };
      }
      acc[month].leads += 1;
      return acc;
    }, {});
    
    // Add deal data to monthly breakdown
    deals.forEach(deal => {
      const month = new Date(deal.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { leads: 0, deals: 0, revenue: 0 };
      }
      monthlyBreakdown[month].deals += 1;
      monthlyBreakdown[month].revenue += parsePrice(deal.price);
    });
    
    // Calculate additional metrics
    const wonDeals = deals.filter(deal => deal.status === 'WON');
    const wonRevenue = wonDeals.reduce((sum, deal) => sum + parsePrice(deal.price), 0);
    const lostDeals = deals.filter(deal => deal.status === 'LOST');
    const activeDeals = deals.filter(deal => !['WON', 'LOST'].includes(deal.status));
    
    // Calculate average deal value
    const averageDealValue = totalDeals > 0 ? totalRevenue / totalDeals : 0;
    
    // Calculate win rate
    const winRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;
    
    // Calculate loss rate
    const lossRate = totalDeals > 0 ? (lostDeals.length / totalDeals) * 100 : 0;

    return {
      totalLeads,
      totalDeals,
      totalRevenue,
      conversionRate,
      leadStatusBreakdown,
      dealStatusBreakdown,
      productPerformance,
      monthlyBreakdown: Object.entries(monthlyBreakdown).map(([month, data]) => ({
        month,
        ...data
      })),
      // Additional metrics
      wonDeals: wonDeals.length,
      wonRevenue,
      lostDeals: lostDeals.length,
      activeDeals: activeDeals.length,
      averageDealValue,
      winRate,
      lossRate
    };
  };

  useEffect(() => {
    fetchSalesmen();
  }, []);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate' || name === 'endDate') {
      setDateRange(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'salesman') {
      setSelectedSalesman(value);
      setReportData(null); // Clear previous report data
    }
  };

  // Auto-fetch report data when salesman is selected
  useEffect(() => {
    if (selectedSalesman) {
      fetchReportData(selectedSalesman, dateRange.startDate, dateRange.endDate);
    }
  }, [selectedSalesman, dateRange.startDate, dateRange.endDate]);


  const handleGenerateReport = async () => {
    if (!selectedSalesman) {
      setModalData({
        type: 'warning',
        title: 'Selection Required',
        message: 'Please select a salesman first before generating the report.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
      return;
    }

    if (!reportData) {
      setModalData({
        type: 'warning',
        title: 'No Data Available',
        message: 'No data available for the selected salesman and date range.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
      return;
    }

    setIsGenerating(true);

    try {
      // Generate PDF report
      const salesmanData = salesmen.find(s => s.id === parseInt(selectedSalesman));
      const reportContent = generatePDFContent(salesmanData, reportData, dateRange);
      
      // Create and download PDF
      await downloadPDF(reportContent, `${salesmanData?.first_name}_${salesmanData?.last_name}_comprehensive_report.pdf`);
      
      setModalData({
        type: 'success',
        title: 'Report Generated',
        message: `PDF report generated successfully for ${salesmanData?.first_name} ${salesmanData?.last_name}!`,
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error generating report:', error);
      setModalData({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate PDF report. Please try again.',
        confirmText: 'OK',
        showCancel: false,
        onConfirm: null
      });
      setShowModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate PDF content
  const generatePDFContent = (salesman, data, dateRange) => {
    const period = dateRange.startDate && dateRange.endDate 
      ? `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
      : 'All Time';
    
    return {
      title: 'Comprehensive Salesman Performance Report',
      salesman: `${salesman?.first_name} ${salesman?.last_name}`,
      period,
      data,
      generatedAt: new Date().toLocaleString()
    };
  };


  // Download Minimal Single Page PDF Report
  const downloadPDF = async (content, filename) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Proper page margins
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Ultra Minimal Color Palette
      const colors = {
        primary: [0, 0, 0],         // Pure black
        secondary: [64, 64, 64],    // Dark gray
        accent: [0, 0, 0],          // Black for emphasis
        success: [0, 128, 0],       // Dark green
        warning: [128, 128, 0],     // Dark yellow
        danger: [128, 0, 0],        // Dark red
        light: [248, 248, 248],     // Very light gray
        text: [32, 32, 32],         // Dark gray text
        muted: [96, 96, 96]         // Medium gray
      };

      // Helper function to format currency with ₹ symbol
      const formatCurrency = (amount) => {
        return `₹${amount.toLocaleString('en-IN')}`;
      };

      // Helper function to draw a minimal metric
      const drawMinimalMetric = (label, value, x, y, color = colors.primary) => {
        // Value
        doc.setTextColor(...color);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(value, x, y);
        
        // Label
        doc.setTextColor(...colors.muted);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x, y + 7);
      };

      // Helper function to draw a minimal progress bar
      const drawMinimalProgress = (label, percentage, x, y, width = 50, color = colors.accent) => {
        // Label
        doc.setTextColor(...colors.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x, y);
        
        // Progress bar background (minimal)
        doc.setFillColor(240, 240, 240);
        doc.rect(x, y + 3, width, 3, 'F');
        
        // Progress bar fill
        doc.setFillColor(...color);
        doc.rect(x, y + 3, (width * percentage) / 100, 3, 'F');
        
        // Percentage text
        doc.setTextColor(...colors.text);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${percentage.toFixed(0)}%`, x + width + 5, y + 6);
      };

      // ===== MINIMAL HEADER =====
      // Title
      doc.setTextColor(...colors.primary);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('SALES PERFORMANCE REPORT', margin, yPosition);
      
      // Salesman and period
      doc.setTextColor(...colors.muted);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`${content.salesman} • ${content.period}`, margin, yPosition + 10);
      
      // Minimal separator line
      doc.setDrawColor(...colors.muted);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition + 18, pageWidth - margin, yPosition + 18);
      
      yPosition += 25;

      // ===== KEY METRICS SECTION =====
      // Section header
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('KEY METRICS', margin, yPosition);
      
      yPosition += 12;
      
      // First row of metrics
      const metricWidth = contentWidth / 4;
      drawMinimalMetric('Total Leads', content.data.totalLeads.toString(), margin, yPosition, colors.primary);
      drawMinimalMetric('Total Deals', content.data.totalDeals.toString(), margin + metricWidth, yPosition, colors.primary);
      drawMinimalMetric('Total Revenue', formatCurrency(content.data.totalRevenue), margin + (metricWidth * 2), yPosition, colors.primary);
      drawMinimalMetric('Conversion Rate', `${content.data.conversionRate.toFixed(1)}%`, margin + (metricWidth * 3), yPosition, colors.primary);
      
      yPosition += 20;
      
      // Second row of metrics
      drawMinimalMetric('Win Rate', `${content.data.winRate.toFixed(1)}%`, margin, yPosition, colors.primary);
      drawMinimalMetric('Active Deals', content.data.activeDeals.toString(), margin + metricWidth, yPosition, colors.primary);
      drawMinimalMetric('Avg Deal Value', formatCurrency(content.data.averageDealValue), margin + (metricWidth * 2), yPosition, colors.primary);
      drawMinimalMetric('Won Revenue', formatCurrency(content.data.wonRevenue), margin + (metricWidth * 3), yPosition, colors.primary);
      
      yPosition += 30;

      // ===== PERFORMANCE INDICATORS =====
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PERFORMANCE INDICATORS', margin, yPosition);
      yPosition += 12;
      
      // Progress bars with proper spacing
      const progressWidth = (contentWidth - 20) / 3;
      drawMinimalProgress('Lead Conversion', content.data.conversionRate, margin, yPosition, progressWidth, colors.primary);
      drawMinimalProgress('Deal Win Rate', content.data.winRate, margin + progressWidth + 10, yPosition, progressWidth, colors.primary);
      drawMinimalProgress('Revenue Achievement', content.data.totalRevenue > 0 ? 100 : 0, margin + (progressWidth * 2) + 20, yPosition, progressWidth, colors.primary);
      
      yPosition += 20;

      // ===== DEAL PERFORMANCE TABLE =====
      if (typeof doc.autoTable === 'function') {
        doc.setTextColor(...colors.primary);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DEAL PERFORMANCE', margin, yPosition);
        yPosition += 10;
        
        const dealData = [
          ['Won', content.data.wonDeals.toString(), `${content.data.winRate.toFixed(1)}%`, formatCurrency(content.data.wonRevenue)],
          ['Lost', content.data.lostDeals.toString(), `${content.data.lossRate.toFixed(1)}%`, formatCurrency(0)],
          ['Active', content.data.activeDeals.toString(), `${content.data.totalDeals > 0 ? ((content.data.activeDeals / content.data.totalDeals) * 100).toFixed(1) : 0}%`, formatCurrency(content.data.totalRevenue - content.data.wonRevenue)]
        ];
        
        doc.autoTable({
          startY: yPosition,
          head: [['Status', 'Count', 'Rate', 'Revenue']],
          body: dealData,
          theme: 'striped',
          headStyles: { 
            fillColor: colors.primary, 
            textColor: [255, 255, 255],
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: { 
            fontSize: 9,
            textColor: colors.text
          },
          alternateRowStyles: { 
            fillColor: colors.light 
          },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 40, halign: 'right' }
          },
          margin: { left: margin, right: margin, top: 5, bottom: 5 },
          tableWidth: 'auto'
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // ===== LEAD STATUS BREAKDOWN =====
      if (Object.keys(content.data.leadStatusBreakdown).length > 0) {
        doc.setTextColor(...colors.primary);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('LEAD STATUS BREAKDOWN', margin, yPosition);
        yPosition += 10;
        
        if (typeof doc.autoTable === 'function') {
          const leadData = Object.entries(content.data.leadStatusBreakdown).map(([status, count]) => [
            status,
            count.toString(),
            `${((count / content.data.totalLeads) * 100).toFixed(1)}%`
          ]);
          
          doc.autoTable({
            startY: yPosition,
            head: [['Status', 'Count', 'Percentage']],
            body: leadData,
            theme: 'striped',
            headStyles: { 
              fillColor: colors.primary, 
              textColor: [255, 255, 255],
              fontSize: 10,
              fontStyle: 'bold'
            },
            bodyStyles: { 
              fontSize: 9,
              textColor: colors.text
            },
            alternateRowStyles: { 
              fillColor: colors.light 
            },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 30, halign: 'center' },
              2: { cellWidth: 30, halign: 'center' }
            },
            margin: { left: margin, right: margin, top: 5, bottom: 5 },
            tableWidth: 'auto'
          });
          
          yPosition = doc.lastAutoTable.finalY + 15;
        }
      }

      // ===== PRODUCT PERFORMANCE =====
      if (Object.keys(content.data.productPerformance).length > 0) {
        doc.setTextColor(...colors.primary);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUCT PERFORMANCE', margin, yPosition);
        yPosition += 10;
        
        if (typeof doc.autoTable === 'function') {
          const productData = Object.entries(content.data.productPerformance).map(([product, metrics]) => [
            product,
            metrics.sales.toString(),
            formatCurrency(metrics.revenue),
            formatCurrency(Math.round(metrics.revenue / metrics.sales))
          ]);
          
          doc.autoTable({
            startY: yPosition,
            head: [['Product', 'Sales', 'Revenue', 'Avg Value']],
            body: productData,
            theme: 'striped',
            headStyles: { 
              fillColor: colors.primary, 
              textColor: [255, 255, 255],
              fontSize: 10,
              fontStyle: 'bold'
            },
            bodyStyles: { 
              fontSize: 9,
              textColor: colors.text
            },
            alternateRowStyles: { 
              fillColor: colors.light 
            },
            columnStyles: {
              0: { cellWidth: 50 },
              1: { cellWidth: 25, halign: 'center' },
              2: { cellWidth: 35, halign: 'right' },
              3: { cellWidth: 30, halign: 'right' }
            },
            margin: { left: margin, right: margin, top: 5, bottom: 5 },
            tableWidth: 'auto'
          });
          
          yPosition = doc.lastAutoTable.finalY + 15;
        }
      }

      // ===== MONTHLY TRENDS =====
      if (content.data.monthlyBreakdown.length > 0) {
        doc.setTextColor(...colors.primary);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('MONTHLY TRENDS', margin, yPosition);
        yPosition += 10;
        
        if (typeof doc.autoTable === 'function') {
          const monthlyData = content.data.monthlyBreakdown.slice(0, 6).map(month => [ // Limit to 6 months for space
            month.month,
            month.leads.toString(),
            month.deals.toString(),
            formatCurrency(month.revenue),
            month.leads > 0 ? `${((month.deals / month.leads) * 100).toFixed(1)}%` : '0%'
          ]);
          
          doc.autoTable({
            startY: yPosition,
            head: [['Month', 'Leads', 'Deals', 'Revenue', 'Conv.']],
            body: monthlyData,
            theme: 'striped',
            headStyles: { 
              fillColor: colors.primary, 
              textColor: [255, 255, 255],
              fontSize: 10,
              fontStyle: 'bold'
            },
            bodyStyles: { 
              fontSize: 9,
              textColor: colors.text
            },
            alternateRowStyles: { 
              fillColor: colors.light 
            },
            columnStyles: {
              0: { cellWidth: 30 },
              1: { cellWidth: 22, halign: 'center' },
              2: { cellWidth: 22, halign: 'center' },
              3: { cellWidth: 35, halign: 'right' },
              4: { cellWidth: 25, halign: 'center' }
            },
            margin: { left: margin, right: margin, top: 5, bottom: 5 },
            tableWidth: 'auto'
          });
          
          yPosition = doc.lastAutoTable.finalY + 15;
        }
      }

      // ===== KEY INSIGHTS =====
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('KEY INSIGHTS', margin, yPosition);
      yPosition += 10;
      
      const insights = [];
      if (content.data.conversionRate < 30) {
        insights.push('• Low conversion rate - improve lead qualification');
      }
      if (content.data.winRate < 50) {
        insights.push('• Win rate needs improvement - focus on proposals');
      }
      if (content.data.activeDeals > 0) {
        insights.push(`• ${content.data.activeDeals} active deals in pipeline`);
      }
      if (content.data.totalRevenue > 0) {
        insights.push('• Strong revenue generation - scale successful strategies');
      }
      
      insights.forEach(insight => {
        doc.setTextColor(...colors.text);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(insight, margin + 10, yPosition);
        yPosition += 8;
      });

      // ===== MINIMAL FOOTER =====
      // Footer line
      doc.setDrawColor(...colors.muted);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Footer text
      doc.setTextColor(...colors.muted);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('CRM Performance Report', margin, pageHeight - 8);
      doc.text(`Generated: ${content.generatedAt}`, pageWidth - margin - 60, pageHeight - 8);

      // Save the PDF
      doc.save(filename);
    } catch (error) {
      console.error('Error generating compact PDF:', error);
      throw error;
    }
  };


  const selectedSalesmanData = salesmen.find(s => s.id === parseInt(selectedSalesman));

  return (
    <div className="report-generation">
      <div className="report-header">
        <div className="header-content">
          <Download size={24} />
          <h2>Report Generation</h2>
          <p>Generate detailed PDF reports for individual salesman</p>
        </div>
      </div>

      <div className="report-content">
        <div className="report-form-section">
          <div className="form-header">
            <FileText size={20} />
            <h3>Report Configuration</h3>
          </div>

          <div className="report-form">
            <div className="form-group">
              <label htmlFor="salesman">
                <User size={16} />
                Select Salesman *
              </label>
              <select
                id="salesman"
                name="salesman"
                value={selectedSalesman}
                onChange={handleInputChange}
                required
                disabled={loading}
              >
                <option value="">Choose a salesman...</option>
                {salesmen.map(salesman => (
                  <option key={salesman.id} value={salesman.id}>
                    {salesman.first_name} {salesman.last_name} ({salesman.username})
                  </option>
                ))}
              </select>
            </div>


            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  <Calendar size={16} />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  <Calendar size={16} />
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={handleGenerateReport}
                disabled={!selectedSalesman || isGenerating}
                className="generate-btn"
              >
                <Download size={16} />
                {isGenerating ? 'Generating PDF...' : 'Generate PDF Report'}
              </button>
            </div>
          </div>
        </div>

        {selectedSalesman && reportData && selectedSalesmanData && (
          <div className="report-preview-section">
            <div className="preview-header">
              <h3>Report Preview</h3>
              <span className="preview-badge">Live Preview</span>
            </div>

            <div className="report-preview">
              <div className="preview-header-section">
                <h2>Salesman Performance Report</h2>
                <div className="report-meta">
                  <p><strong>Salesman:</strong> {selectedSalesmanData.first_name} {selectedSalesmanData.last_name}</p>
                  <p><strong>Period:</strong> {dateRange.startDate && dateRange.endDate 
                    ? `${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
                    : 'All Time'}</p>
                  <p><strong>Report Type:</strong> Comprehensive Performance Report</p>
                </div>
              </div>

              <div className="preview-summary">
                <h3>Performance Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <Users size={20} />
                    <div>
                      <span className="summary-value">{reportData.totalLeads}</span>
                      <span className="summary-label">Total Leads</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <Target size={20} />
                    <div>
                      <span className="summary-value">{reportData.totalDeals}</span>
                      <span className="summary-label">Total Deals</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <DollarSign size={20} />
                    <div>
                      <span className="summary-value">₹{reportData.totalRevenue.toLocaleString()}</span>
                    <span className="summary-label">Total Revenue</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <TrendingUp size={20} />
                    <div>
                      <span className="summary-value">{reportData.conversionRate.toFixed(1)}%</span>
                    <span className="summary-label">Conversion Rate</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <Award size={20} />
                    <div>
                      <span className="summary-value">{reportData.winRate.toFixed(1)}%</span>
                      <span className="summary-label">Win Rate</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <Activity size={20} />
                    <div>
                      <span className="summary-value">{reportData.activeDeals}</span>
                      <span className="summary-label">Active Deals</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="preview-breakdown">
                <h3>Lead Status Breakdown</h3>
                <div className="breakdown-table">
                  <div className="table-header">
                    <div>Status</div>
                    <div>Count</div>
                    <div>Percentage</div>
                  </div>
                  {Object.entries(reportData.leadStatusBreakdown).map(([status, count], index) => (
                    <div key={index} className="table-row">
                      <div>{status}</div>
                      <div>{count}</div>
                      <div>{((count / reportData.totalLeads) * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="preview-breakdown">
                <h3>Deal Status Breakdown</h3>
                <div className="breakdown-table">
                  <div className="table-header">
                    <div>Status</div>
                    <div>Count</div>
                    <div>Percentage</div>
                      </div>
                  {Object.entries(reportData.dealStatusBreakdown).map(([status, count], index) => (
                    <div key={index} className="table-row">
                      <div>{status}</div>
                      <div>{count}</div>
                      <div>{reportData.totalDeals > 0 ? ((count / reportData.totalDeals) * 100).toFixed(1) : 0}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="preview-breakdown">
                <h3>Deal Performance Metrics</h3>
                <div className="breakdown-table">
                  <div className="table-header">
                    <div>Metric</div>
                    <div>Value</div>
                    <div>Percentage</div>
                  </div>
                  <div className="table-row">
                    <div>Won Deals</div>
                    <div>{reportData.wonDeals}</div>
                    <div>{reportData.winRate.toFixed(1)}%</div>
                  </div>
                  <div className="table-row">
                    <div>Lost Deals</div>
                    <div>{reportData.lostDeals}</div>
                    <div>{reportData.lossRate.toFixed(1)}%</div>
                  </div>
                  <div className="table-row">
                    <div>Active Deals</div>
                    <div>{reportData.activeDeals}</div>
                    <div>{reportData.totalDeals > 0 ? ((reportData.activeDeals / reportData.totalDeals) * 100).toFixed(1) : 0}%</div>
                  </div>
                  <div className="table-row">
                    <div>Won Revenue</div>
                    <div>₹{reportData.wonRevenue.toLocaleString()}</div>
                    <div>{reportData.totalRevenue > 0 ? ((reportData.wonRevenue / reportData.totalRevenue) * 100).toFixed(1) : 0}%</div>
                  </div>
                  <div className="table-row">
                    <div>Average Deal Value</div>
                    <div>₹{reportData.averageDealValue.toLocaleString()}</div>
                    <div>-</div>
                  </div>
                </div>
                  </div>
                  
              {Object.keys(reportData.productPerformance).length > 0 && (
                <div className="preview-products">
                  <h3>Product Performance</h3>
                  <div className="products-list">
                    {Object.entries(reportData.productPerformance).map(([product, metrics], index) => (
                      <div key={index} className="product-item">
                        <div className="product-name">{product}</div>
                        <div className="product-metrics">
                          <span>{metrics.sales} sales</span>
                          <span>₹{metrics.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData.monthlyBreakdown.length > 0 && (
                <div className="preview-breakdown">
                  <h3>Monthly Breakdown</h3>
                  <div className="breakdown-table">
                    <div className="table-header">
                      <div>Month</div>
                      <div>Leads</div>
                      <div>Deals</div>
                      <div>Revenue</div>
                    </div>
                    {reportData.monthlyBreakdown.map((month, index) => (
                      <div key={index} className="table-row">
                        <div>{month.month}</div>
                        <div>{month.leads}</div>
                        <div>{month.deals}</div>
                        <div>₹{month.revenue.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData.totalLeads === 0 && reportData.totalDeals === 0 && (
                <div className="no-data-section">
                  <AlertCircle size={48} color="#6b7280" />
                  <h3>No Data Available</h3>
                  <p>No leads or deals found for the selected salesman and date range.</p>
              </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Professional Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalData.type}
        title={modalData.title}
        message={modalData.message}
        confirmText={modalData.confirmText}
        showCancel={modalData.showCancel}
        onConfirm={modalData.onConfirm}
        size="medium"
      />
    </div>
  );
};

export default ReportGeneration;
