
interface CustomersTabProps {
  customers: any[];
  onViewCustomer: (customer: any) => void;
}
export default function CustomersTab({ customers, onViewCustomer }: CustomersTabProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tên Khách Hàng</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Số Điện Thoại</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ngày Đăng Ký</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 font-medium">{customer.name}</td>
              <td className="px-6 py-4">{customer.phone}</td>
              <td className="px-6 py-4">{customer.email || 'N/A'}</td>
              <td className="px-6 py-4">
                {new Date(customer.created_at).toLocaleDateString('vi-VN')}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => onViewCustomer(customer)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Xem Chi Tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}