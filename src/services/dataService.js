// Data service with API integration for Python backend

class DataService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  // Retrieve auth token from any supported storage key
  getAuthToken() {
    return (
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      ''
    );
  }

  // Helper methods for API calls
  async apiGet(endpoint) {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async apiPost(endpoint, data) {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async apiPut(endpoint, data) {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async apiPatch(endpoint, data) {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  async apiDelete(endpoint) {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : undefined
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // Dashboard metrics
  async getDashboardMetrics() {
    try {
      const response = await this.apiGet('/auth/me');
      // For now, return static data
      return {
        totalProducts: {
          count: 1250,
          change: 12,
          trend: 'up'
        },
        productsSold: {
          count: 856,
          change: 8,
          trend: 'up'
        },
        leads: {
          active: 234,
          inactive: 89,
          total: 323,
          change: 15,
          trend: 'up'
        },
        upcomingDeals: {
          count: 47,
          value: 285000,
          change: -3,
          trend: 'down'
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  // Sales chart data
  async getSalesChartData() {
    // Return static data for now
    return [
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
  }

  // Products data
  async getProducts() {
    try {
      const response = await this.apiGet('/products');
      return response.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Product Management methods
  async getProductPortfolio() {
    try {
      const response = await this.apiGet('/products');
      return response.products || [];
    } catch (error) {
      console.error('Error fetching product portfolio:', error);
      throw error;
    }
  }

  async addProduct(productData) {
    try {
      const response = await this.apiPost('/products', productData);
      return response;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(productId, productData) {
    try {
      const response = await this.apiPut(`/products/${productId}`, productData);
      return response;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const response = await this.apiDelete(`/products/${productId}`);
      return response;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateProductStatus(productId, status) {
    try {
      const response = await this.apiPut(`/products/${productId}`, { status });
      return response;
    } catch (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  }

  // Lead Management methods
  async getLeads() {
    try {
      const response = await this.apiGet('/leads');
      return response.leads || [];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  async addLead(leadData) {
    try {
      const response = await this.apiPost('/leads', leadData);
      return response;
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  }

  async updateLead(leadId, leadData) {
    try {
      const response = await this.apiPut(`/leads/${leadId}`, leadData);
      return response;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  async deleteLead(leadId) {
    try {
      const response = await this.apiDelete(`/leads/${leadId}`);
      return response;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  async updateLeadStatus(leadId, status) {
    try {
      const response = await this.apiPatch(`/leads/${leadId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  }

  // Salesman data
  async getSalesmen() {
    try {
      const response = await this.apiGet('/salesmen');
      return response.salesmen || [];
    } catch (error) {
      console.error('Error fetching salesmen:', error);
      throw error;
    }
  }

  async createSalesman(salesmanData) {
    try {
      const response = await this.apiPost('/salesmen', salesmanData);
      return response;
    } catch (error) {
      console.error('Error creating salesman:', error);
      throw error;
    }
  }

  async updateSalesman(salesmanId, salesmanData) {
    try {
      const response = await this.apiPut(`/salesmen/${salesmanId}`, salesmanData);
      return response;
    } catch (error) {
      console.error('Error updating salesman:', error);
      throw error;
    }
  }

  async deleteSalesman(salesmanId) {
    try {
      const response = await this.apiDelete(`/salesmen/${salesmanId}`);
      return response;
    } catch (error) {
      console.error('Error deleting salesman:', error);
      throw error;
    }
  }

  async resetSalesmanPassword(salesmanId) {
    try {
      const response = await this.apiPost(`/salesmen/${salesmanId}/reset-password`, {});
      return response;
    } catch (error) {
      console.error('Error resetting salesman password:', error);
      throw error;
    }
  }

  // Task Management methods
  async assignTask(taskData) {
    try {
      const response = await this.apiPost('/tasks', taskData);
      return response;
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }

  async getAssignedTasks() {
    try {
      const response = await this.apiGet('/tasks');
      return response.tasks || [];
    } catch (error) {
      console.error('Error fetching assigned tasks:', error);
      throw error;
    }
  }

  async updateTask(taskId, taskData) {
    try {
      const response = await this.apiPut(`/tasks/${taskId}`, taskData);
      return response;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      const response = await this.apiPatch(`/tasks/${taskId}/status`, {
        status: status
      });
      return response;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async deleteTask(taskId) {
    try {
      const response = await this.apiDelete(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Salesman portal methods
  async getSalesmanTasks() {
    try {
      const response = await this.apiGet('/salesman/tasks');
      return response.tasks || [];
    } catch (error) {
      console.error('Error fetching salesman tasks:', error);
      throw error;
    }
  }

  async updateTaskProgress(taskId, currentQuantity) {
    try {
      const response = await this.apiPatch(`/salesman/tasks/${taskId}/progress`, {
        current_quantity: currentQuantity
      });
      return response;
    } catch (error) {
      console.error('Error updating task progress:', error);
      throw error;
    }
  }

  // Upcoming deals
  async getUpcomingDeals() {
    // Return static data for now
    return [
      { id: 1, company: 'Tech Solutions', value: 45000, date: '2024-01-15', probability: 85 },
      { id: 2, company: 'Digital Agency', value: 32000, date: '2024-01-20', probability: 70 },
    ];
  }

  // Deals management methods
  async getDeals() {
    try {
      const response = await this.apiGet('/deals');
      return response.deals || [];
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  async createDeal(dealData) {
    try {
      const response = await this.apiPost('/deals', dealData);
      return response;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async updateDeal(dealId, dealData) {
    try {
      const response = await this.apiPut(`/deals/${dealId}`, dealData);
      return response;
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  async deleteDeal(dealId) {
    try {
      const response = await this.apiDelete(`/deals/${dealId}`);
      return response;
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  }

  async updateDealStatus(dealId, status) {
    try {
      const response = await this.apiPatch(`/deals/${dealId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating deal status:', error);
      throw error;
    }
  }

  // Salesman updates for main users
  async getSalesmanUpdates() {
    try {
      const response = await this.apiGet('/salesman-updates');
      return response;
    } catch (error) {
      console.error('Error fetching salesman updates:', error);
      throw error;
    }
  }

  // Helper method to simulate API delay (for testing)
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Meeting Management methods
  async getMeetings() {
    try {
      const response = await this.apiGet('/meetings');
      return response.meetings || [];
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }

  async addMeeting(meetingData) {
    try {
      const response = await this.apiPost('/meetings', meetingData);
      return response;
    } catch (error) {
      console.error('Error adding meeting:', error);
      throw error;
    }
  }

  async updateMeeting(meetingId, meetingData) {
    try {
      const response = await this.apiPut(`/meetings/${meetingId}`, meetingData);
      return response;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  async deleteMeeting(meetingId) {
    try {
      const response = await this.apiDelete(`/meetings/${meetingId}`);
      return response;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }

  async updateMeetingStatus(meetingId, status) {
    try {
      const response = await this.apiPatch(`/meetings/${meetingId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Error updating meeting status:', error);
      throw error;
    }
  }
}

const dataServiceInstance = new DataService();
export default dataServiceInstance;