import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');

        let blogPosts;
        if (category) {
            blogPosts = await prisma.blogPost.findMany({
                where: {
                    category: category,
                },
            });
        } else {
            blogPosts = await prisma.blogPost.findMany();
        }

        return NextResponse.json(blogPosts);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { title, content, excerpt, image, published, category } = await request.json();
        const slug = slugify(title);
        const blogPost = await prisma.blogPost.create({
            data: {
                title,
                content,
                excerpt,
                image,
                published,
                category,
            },
        });
        return NextResponse.json(blogPost, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }
}
