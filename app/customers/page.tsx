import { getCustomers } from '@/app/actions/customers'
import Sidebar from '@/components/Sidebar'
import CustomersTable from '@/components/CustomersTable'

export default async function CustomersPage() {
  let customers = []
  try {
    customers = await getCustomers()
  } catch (error) {
    console.error('Error loading customers page:', error)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Müşteriler</h1>
          </div>
          <CustomersTable customers={customers} />
        </div>
      </main>
    </div>
  )
}
