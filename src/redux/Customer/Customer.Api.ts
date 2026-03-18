// src/redux/Customer/Customer.Api.ts
import { getApiUrl } from '../../utils/dbUrl';
import { Customer, CustomerWithBookings } from '../../types/Customer.types';

export const customerApi = {
  getAllCustomers: async (token: string): Promise<Customer[]> => {
    const response = await fetch(getApiUrl('/customers'), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    const data = await response.json();
    return data.data;
  },

  getCustomerById: async (id: string, token: string): Promise<Customer> => {
    const response = await fetch(getApiUrl(`/customers/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    const data = await response.json();
    return data.data;
  },

  getCustomerByPhone: async (phone: string, token: string): Promise<Customer> => {
    const response = await fetch(getApiUrl(`/customers/phone/${phone}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    const data = await response.json();
    return data.data;
  },

  getCustomerWithBookings: async (id: string, token: string): Promise<CustomerWithBookings> => {
    const response = await fetch(getApiUrl(`/customers/${id}/bookings`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch customer with bookings');
    }
    const data = await response.json();
    return data.data;
  },

  createCustomer: async (customer: Partial<Customer>, token: string): Promise<Customer> => {
    const response = await fetch(getApiUrl('/customers'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error('Failed to create customer');
    }
    const data = await response.json();
    return data.data;
  },

  updateCustomer: async (id: string, customer: Partial<Customer>, token: string): Promise<Customer> => {
    const response = await fetch(getApiUrl(`/customers/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(customer),
    });
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    const data = await response.json();
    return data.data;
  },

  deleteCustomer: async (id: string, token: string): Promise<void> => {
    const response = await fetch(getApiUrl(`/customers/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
  },
};