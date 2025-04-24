'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', title: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Response is not JSON');
        }
        const data = await res.json();
        const item = data.find(p => p._id === id);
        if (item) {
          setForm({ name: item.name, title: item.title || '' });
        } else {
          throw new Error('Item not found');
        }
      } catch (error) {
        console.error('Error fetching item:', error);
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
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/posts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, _id: id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      await response.json();
      await Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: 'แก้ไขสินค้าเรียบร้อยแล้ว!',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#3085d6',
      });
      router.push('/');
    } catch (error) {
      console.error('Error updating item:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถแก้ไขสินค้าได้',
        confirmButtonText: 'ตกลง',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (change) => {
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

      // รีเฟรชหน้าเพื่อแสดงข้อมูลล่าสุด
      router.refresh();
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

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">แก้ไขสินค้า</h2>
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
      ) : (
        <div className="space-y-6">
          {/* ฟอร์มสำหรับแก้ไขข้อมูลสินค้า */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-semibold">ชื่อสินค้า</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="ชื่อสินค้า"
                className="p-2 border rounded w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">รายละเอียด</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="รายละเอียด"
                className="p-2 border rounded w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                บันทึก
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                ยกเลิก
              </button>
            </div>
          </form>

          {/* ส่วนสำหรับเพิ่ม/ลดจำนวนสินค้า */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">จัดการจำนวนสินค้า</h3>
            <div className="flex gap-2">
              <button
                onClick={() => updateQuantity(1)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                เพิ่มจำนวน
              </button>
              <button
                onClick={() => updateQuantity(-1)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                ลดจำนวน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}