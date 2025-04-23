import { NextResponse } from 'next/server';
import connectMongo from '../../../../../lib/mongodb';
import Post from '../../../../../models/post';
import History from '../../../../../models/history';

export async function PUT(req) {
  try {
    await connectMongo();
    const { _id, name, title, quantity } = await req.json();

    const post = await Post.findById(_id);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ตรวจสอบการเปลี่ยนแปลงของ quantity
    if (post.quantity !== quantity) {
      const quantityChange = quantity - post.quantity;
      const action = quantityChange > 0 ? 'add' : 'remove';
      const historyEntry = new History({
        itemId: post._id,
        itemName: post.name,
        action: action,
        quantity: Math.abs(quantityChange),
        timestamp: new Date(),
      });
      await historyEntry.save();
      console.log('History entry created on UPDATE:', historyEntry);
    }

    // อัปเดตข้อมูล
    post.name = name;
    post.title = title;
    post.quantity = quantity;
    await post.save();

    return NextResponse.json({ message: "Updated", updated: post }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/posts/update:', error);
    return NextResponse.json(
      { error: 'Failed to update post', details: error.message },
      { status: 500 }
    );
  }
}