export interface Driver {
  _id: string;
  name: string;
  phone: string;
  license_number: string;
  status: 'active' | 'inactive' | 'busy';
  username?: string;
  created_at: string;
  updated_at?: string;
}