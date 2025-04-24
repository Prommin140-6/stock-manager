'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const data = await res.json();
      console.log('Fetched items:', data);
      setItems(data);
      setFilteredItems(data);
      console.log('State items set to:', data);
      console.log('State filteredItems set to:', data);

      const zeroQuantityItems = data.filter(item => item.quantity === 0);
      if (zeroQuantityItems.length > 0) {
        console.log('Items with quantity 0:', zeroQuantityItems);
        await Swal.fire({
          icon: 'info',
          title: 'ตรวจพบสินค้าที่เหลือ 0 ชิ้น',
          text: `มีสินค้า ${zeroQuantityItems.length} รายการที่เหลือ 0 ชิ้น`,
          confirmButtonText: 'ตกลง',
        });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลสินค้าได้',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        (item.title && item.title.toLowerCase().includes(term))
    );
    console.log('Filtered items after search:', filtered);
    setFilteredItems(filtered);
    console.log('State filteredItems set to:', filtered);
  };

  const updateQuantity = async (id, change) => {
    setLoading(true);
    try {
      const { value: formValues } = await Swal.fire({
        title: change > 0 ? 'เพิ่มจำนวนสินค้า' : 'ลดจำนวนสินค้า',
        html: `
          <input type="number" id="quantity" class="swal2-input" placeholder="จำนวน" min="1" value="1">
          <input type="text" id="requester" class="swal2-input" placeholder="ชื่อผู้เบิก">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        preConfirm: () => {
          const quantityInput = document.getElementById('quantity').value;
          const requesterInput = document.getElementById('requester').value.trim();

          if (!quantityInput || quantityInput <= 0) {
            Swal.showValidationMessage('กรุณากรอกจำนวนที่มากกว่า 0');
            return false;
          }
          if (!requesterInput) {
            Swal.showValidationMessage('กรุณากรอกชื่อผู้เบิก');
            return false;
          }

          return {
            quantity: parseInt(quantityInput),
            requester: requesterInput,
          };
        },
        didOpen: () => {
          const confirmButton = Swal.getConfirmButton();
          const quantityInput = document.getElementById('quantity');
          const requesterInput = document.getElementById('requester');

          const validateInputs = () => {
            const quantity = quantityInput.value;
            const requester = requesterInput.value.trim();
            confirmButton.disabled = !quantity || quantity <= 0 || !requester;
          };

          quantityInput.addEventListener('input', validateInputs);
          requesterInput.addEventListener('input', validateInputs);
          validateInputs();
        },
      });

      if (!formValues) {
        setLoading(false);
        return;
      }

      const { quantity, requester } = formValues;

      const response = await fetch('/api/posts', {
        method: change > 0 ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity: Math.abs(quantity * change), requester }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      const result = await response.json();
      console.log('Update response:', result);

      if (change < 0 && result.post && result.post.quantity === 0) {
        await Swal.fire({
          icon: 'info',
          title: 'สินค้าหมด',
          text: `สินค้า "${result.post.name}" เหลือ 0 ชิ้นแล้ว`,
          confirmButtonText: 'ตกลง',
        });
      }

      await fetchItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัปเดตจำนวนสินค้าได้',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการลบ',
      text: `คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${item.name}" ทั้งหมด?`,
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      console.log('Delete confirmed for item:', item);
      setLoading(true);
      try {
        const { value: requester } = await Swal.fire({
          title: 'กรอกชื่อผู้เบิก',
          input: 'text',
          inputLabel: 'ชื่อผู้เบิก',
          inputPlaceholder: 'กรอกชื่อผู้เบิก',
          showCancelButton: true,
          confirmButtonText: 'ตกลง',
          cancelButtonText: 'ยกเลิก',
          inputValidator: (value) => {
            if (!value.trim()) {
              return 'กรุณากรอกชื่อผู้เบิก';
            }
          },
          didOpen: () => {
            const confirmButton = Swal.getConfirmButton();
            const input = Swal.getInput();
            confirmButton.disabled = true;
            input.addEventListener('input', () => {
              confirmButton.disabled = !input.value.trim();
            });
          },
        });

        if (!requester) {
          setLoading(false);
          return;
        }

        console.log('Sending DELETE request for item:', item._id);
        const response = await fetch('/api/posts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item._id, requester }),
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }

        const data = await response.json();
        console.log('DELETE response:', data);

        const updatedItems = items.filter(i => i._id !== item._id);
        setItems(updatedItems);
        const updatedFilteredItems = filteredItems.filter(i => i._id !== item._id);
        setFilteredItems(updatedFilteredItems);
        console.log('Updated items after delete:', updatedItems);
        console.log('Updated filteredItems after delete:', updatedFilteredItems);

        Swal.fire({
          icon: 'success',
          title: 'ลบสำเร็จ',
          text: `สินค้า "${item.name}" ถูกลบเรียบร้อยแล้ว`,
          confirmButtonText: 'ตกลง',
        });
      } catch (error) {
        console.error('Error deleting item:', error.message, error.stack);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: `ไม่สามารถลบสินค้าได้: ${error.message}`,
          confirmButtonText: 'ตกลง',
        });
        await fetchItems();
      } finally {
        setLoading(false);
      }
    } else {
      console.log('Delete cancelled for item:', item);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 รายการสินค้าในคลัง</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="ค้นหาสินค้า..."
          value={searchTerm}
          onChange={handleSearch}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => router.push('/create')}
          className="bg-green-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <span>➕</span> เพิ่มสินค้า
        </button>
        <button
          onClick={() => router.push('/history')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <span>📜</span> ดูประวัติการทำรายการ
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 mr-2 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8h-8z"
            />
          </svg>
          กำลังโหลด...
        </p>
      ) : filteredItems.length === 0 ? (
        <p className="text-gray-500">
          {searchTerm ? 'ไม่พบสินค้าที่ค้นหา' : 'ไม่มีสินค้าในสต็อก'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredItems.map((item) => {
            console.log('Rendering item:', item);
            return (
              <div
                key={item._id}
                className={`border那么: 'border rounded p-3 shadow ${
                  item.quantity < 5 && item.quantity > 0 ? 'bg-red-100' : item.quantity === 0 ? 'bg-gray-100' : ''
                }`}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-40 w-full object-cover mb-1 rounded"
                  />
                )}
                <h2 className="text-base font-semibold truncate">{item.name}</h2>
                <p className="text-xs text-gray-600 truncate">{item.title}</p>
                <p className="font-semibold text-sm my-1">จำนวน: {item.quantity}</p>

                <div className="flex gap-1 mt-1 flex-wrap">
                  <button
                    onClick={() => updateQuantity(item._id, 1)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    + เติม
                  </button>
                  <button
                    onClick={() => updateQuantity(item._id, -1)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                    disabled={item.quantity === 0}
                  >
                    - เบิก
                  </button>
                  <button
                    onClick={() => router.push(`/edit/${item._id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    ✏️ แก้ไข
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    🗑️ ลบ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}