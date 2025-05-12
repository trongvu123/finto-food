import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;
    const blogPost = await prisma.blogPost.findUnique({
      where: {
        id,
      },
    });

    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const { title, content, excerpt, image, published, category } = await request.json();

    const blogPost = await prisma.blogPost.update({
      where: {
        id,
      },
      data: {
        title,
        category,
        content,
        excerpt,
        image,
        published,
      },
    });

    return NextResponse.json(blogPost);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const { id } = params;

    await prisma.blogPost.delete({
      where: {
        id,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
