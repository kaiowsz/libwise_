"use server";

import { prisma } from "@/lib/prisma";
import { r2 } from "@/lib/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { PDFDocument } from "pdf-lib";

export async function createBook(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const summary = formData.get("summary") as string;
  
  const coverFile = formData.get("cover") as File;
  const pdfFile = formData.get("pdf") as File;

  if (!title || !author || !coverFile || !pdfFile) {
    throw new Error("Missing required fields");
  }

  // Ensure user exists in Prisma
  const userInDb = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!userInDb) {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || "unknown@placeholder.com";

    await prisma.user.create({
      data: {
        id: userId,
        email: primaryEmail,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim() : null,
      }
    });
  }

  // Generate unique keys
  const coverKey = `covers/${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const pdfKey = `pdfs/${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const bucket = process.env.R2_BUCKET_NAME!;

  // Upload Cover
  const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: coverKey,
      Body: coverBuffer,
      ContentType: coverFile.type,
    })
  );

  // Upload PDF
  const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: pdfKey,
      Body: pdfBuffer,
      ContentType: pdfFile.type,
    })
  );

  let pages = null;
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pages = pdfDoc.getPageCount();
  } catch (error) {
    console.error("Failed to extract PDF page count:", error);
  }

  const publicUrl = process.env.NEXT_PUBLIC_R2_DEV_URL || process.env.R2_PUBLIC_DEV_URL || "";

  // Insert Book into Database
  await prisma.book.create({
    data: {
      title,
      author,
      summary,
      coverUrl: `${publicUrl}/${coverKey}`,
      pdfUrl: `${publicUrl}/${pdfKey}`,
      userId: userId,
      rating: 0,
      isAvailable: true,
      pages,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getBooks() {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: 'desc' },
  });
  
  const mainBook = books.length > 0 ? books[0] : null;
  const latestBooks = books.length > 1 ? books.slice(1) : [];
  
  return { mainBook, latestBooks, allBooksCount: books.length };
}

export async function getBookById(id: string) {
  return await prisma.book.findUnique({
    where: { id },
    include: {
      user: true,
      category: true,
    }
  });
}

export async function searchBooks(query: string) {
  if (!query || query.trim().length < 2) return [];

  const books = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { author: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      author: true,
      coverUrl: true,
      pages: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return books;
}

export async function deleteBook(bookId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found");
  if (book.userId !== userId) throw new Error("You can only delete your own books");

  const bucket = process.env.R2_BUCKET_NAME!;
  const publicUrl = process.env.NEXT_PUBLIC_R2_DEV_URL || process.env.R2_PUBLIC_DEV_URL || "";

  // Extract R2 keys from full URLs
  const extractKey = (url: string) => url.replace(`${publicUrl}/`, "");

  try {
    // Delete cover from R2
    if (book.coverUrl) {
      await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: extractKey(book.coverUrl) }));
    }
    // Delete PDF from R2
    await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: extractKey(book.pdfUrl) }));
  } catch (err) {
    console.error("Failed to delete R2 objects:", err);
  }

  await prisma.book.delete({ where: { id: bookId } });

  revalidatePath("/");
  return { success: true };
}
