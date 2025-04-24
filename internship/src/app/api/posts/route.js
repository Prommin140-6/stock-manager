import { NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb';
import Post from '../../../../models/post';
import History from '../../../../models/history';

export async function GET() {
  try {
    await connectMongo();
    const posts = await Post.find({}).sort({ createdAt: -1 });
    console.log('Posts fetched in GET:', posts);
    console.log('Posts with quantity 0:', posts.filter(post => post.quantity === 0));
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectMongo();
    const data = await req.json();
    const newPost = new Post(data);
    await newPost.save();

    const historyEntry = new History({
      itemId: newPost._id,
      itemName: newPost.name,
      action: 'add',
      quantity: data.quantity,
      requester: 'ระบบ', // เนื่องจากหน้า /create ยังไม่รองรับการกรอกชื่อผู้เพิ่ม
      timestamp: new Date(),
    });
    await historyEntry.save();
    console.log('History entry created on POST:', historyEntry);

    return NextResponse.json({ message: "Added", post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    return NextResponse.json(
      { error: 'Failed to create post', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectMongo();
    const { id, quantity, requester } = await req.json();

    if (!requester) {
      return NextResponse.json(
        { error: 'Requester is required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const change = quantity;
    post.quantity += change;

    const historyEntry = new History({
      itemId: post._id,
      itemName: post.name,
      action: 'add',
      quantity: Math.abs(change),
      requester,
      timestamp: new Date(),
    });
    await historyEntry.save();
    console.log('History entry created on PUT:', historyEntry);

    await post.save();

    return NextResponse.json({ message: "Updated", post }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/posts:', error);
    return NextResponse.json(
      { error: 'Failed to update post', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await connectMongo();
    const { id, quantity, requester } = await req.json();

    if (!requester) {
      return NextResponse.json(
        { error: 'Requester is required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

    console.log('Post before update:', post);
    console.log('DELETE request data:', { id, quantity, requester });

    if (quantity === undefined || quantity === null) {
      console.log('Performing full deletion for post:', post._id);
      const historyEntry = new History({
        itemId: post._id,
        itemName: post.name,
        action: 'remove',
        quantity: post.quantity,
        requester,
        timestamp: new Date(),
      });
      await historyEntry.save();
      console.log('History entry created on DELETE (full removal):', historyEntry);

      await post.deleteOne();
      console.log('Post deleted from database:', post._id);

      return NextResponse.json({ message: "Deleted" }, { status: 200 });
    }

    console.log('Performing quantity decrease for post:', post._id);
    post.quantity -= quantity;
    if (post.quantity < 0) post.quantity = 0;

    const historyEntry = new History({
      itemId: post._id,
      itemName: post.name,
      action: 'remove',
      quantity: Math.abs(quantity),
      requester,
      timestamp: new Date(),
    });
    await historyEntry.save();
    console.log('History entry created on DELETE (partial removal):', historyEntry);

    await post.save();
    console.log('Post after quantity decrease:', post);

    const updatedPost = await Post.findById(id);
    console.log('Post in database after save:', updatedPost);

    return NextResponse.json({ message: "Quantity decreased", post }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/posts:', error.message, error.stack);
    return NextResponse.json(
      { error: 'Failed to delete post', details: error.message },
      { status: 500 }
    );
  }
}