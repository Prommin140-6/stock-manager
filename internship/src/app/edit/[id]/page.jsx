'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', title: '', quantity: 0 });
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
        if (item) setForm(item);
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
    setForm({ ...form, [name]: name === 'quantity' ? parseInt(value) || 0 : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/posts/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-semibold">ชื่อสินค้า</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="ชื่อสินค้า"
              className="p-2 border rounded w-full"
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
          <div>
            <label className="block mb-1 font-semibold">จำนวน</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="จำนวน"
              className="p-2 border rounded w-full"
              min="0"
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
      )}
    </div>
  );
}