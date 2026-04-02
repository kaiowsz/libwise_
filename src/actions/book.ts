"use server";

import { prisma } from "@/lib/prisma";
import { r2 } from "@/lib/r2";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { PDFDocument } from "pdf-lib";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

const BOOKS_PER_PAGE = 10;
const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB

async function getClientIP(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function getUploadUrls(files: { name: string; type: string }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // Rate limit: 5 url generation requests per minute
  checkRateLimit(`upload_urls:${userId}`, 5, 60_000);

  const bucket = process.env.R2_BUCKET_NAME!;
  
  const urls = await Promise.all(
    files.map(async (f) => {
      const isPdf = f.type === 'application/pdf';
      const folder = isPdf ? 'pdfs' : 'covers';
      const cleanName = f.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const key = `${folder}/${Date.now()}-${cleanName}`;
      
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: f.type,
      });
      
      // URL expires in 15 minutes (900 seconds)
      const url = await getSignedUrl(r2, command, { expiresIn: 900 });
      return { url, key, name: f.name };
    })
  );

  return { success: true, urls };
}

export async function createBook(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Rate limit: 5 creations per minute per user
  checkRateLimit(`create:${userId}`, 5, 60_000);

  const title = formData.get("title") as string;
  const author = formData.get("author") as string;
  const summary = formData.get("summary") as string;
  const categoryName = (formData.get("category") as string)?.trim();
  
  const coverKey = formData.get("coverKey") as string;
  const pdfKey = formData.get("pdfKey") as string;
  const pagesStr = formData.get("pages") as string;
  const pages = pagesStr ? parseInt(pagesStr, 10) : null;

  if (!title || !author || !coverKey || !pdfKey) {
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

  // Handle category (find or create)
  let categoryId: string | null = null;
  if (categoryName) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    categoryId = category.id;
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
      categoryId,
      rating: 0,
      isAvailable: true,
      pages,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateBook(bookId: string, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found");
  if (book.userId !== userId) throw new Error("Você só pode editar seus próprios livros.");

  const title = (formData.get("title") as string)?.trim();
  const author = (formData.get("author") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const categoryName = (formData.get("category") as string)?.trim();

  if (!title || !author) {
    throw new Error("Título e autor são obrigatórios.");
  }

  // Handle category (find or create)
  let categoryId: string | null = null;
  if (categoryName) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    categoryId = category.id;
  }

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title,
      author,
      summary: summary || null,
      categoryId,
    },
  });

  revalidatePath(`/book/${bookId}`);
  revalidatePath("/");
  return { success: true };
}

export async function getBooks({
  page = 1,
  limit = BOOKS_PER_PAGE,
  categoryId,
}: {
  page?: number;
  limit?: number;
  categoryId?: string;
} = {}) {
  const where = categoryId ? { categoryId } : {};
  
  const [books, totalCount] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    totalCount,
  };
}

export async function getPopularBooks({
  page = 1,
  limit = BOOKS_PER_PAGE,
}: {
  page?: number;
  limit?: number;
} = {}) {
  const books = await prisma.book.findMany({
      orderBy: { viewCount: "desc" },
      take: limit,
      include: { category: true },
    });

  return {
    books,
    currentPage: page,
  };
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

export async function incrementViewCount(bookId: string) {
  await prisma.book.update({
    where: { id: bookId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function searchBooks({
  query,
  page = 1,
  limit = BOOKS_PER_PAGE,
}: {
  query: string;
  page?: number;
  limit?: number;
}) {
  if (!query || query.trim().length < 2) return { books: [], totalPages: 0, currentPage: 1, totalCount: 0 };

  // Rate limit: 30 searches per minute per IP
  const ip = await getClientIP();
  checkRateLimit(`search:${ip}`, 30, 60_000);

  const where = {
    OR: [
      { title: { contains: query, mode: "insensitive" as const } },
      { author: { contains: query, mode: "insensitive" as const } },
    ],
  };

  const [books, totalCount] = await Promise.all([
    prisma.book.findMany({
      where,
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        pages: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    totalCount,
  };
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

// --- Category actions ---

export async function getCategories() {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

// --- User actions ---

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getBooksByUser({
  userId,
  page = 1,
  limit = BOOKS_PER_PAGE,
}: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  const where = { userId };

  const [books, totalCount] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    totalCount,
  };
}
