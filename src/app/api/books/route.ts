import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, author, summary, coverUrl, pdfUrl, categoryName } = await req.json();

    if (!title || !author || !pdfUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert Category
    let category = null;
    if (categoryName) {
      category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: { name: categoryName },
      });
    }

    // Create Book
    const book = await prisma.book.create({
      data: {
        title,
        author,
        summary,
        coverUrl,
        pdfUrl,
        userId,
        categoryId: category?.id,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Create Book Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
