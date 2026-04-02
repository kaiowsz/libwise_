import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteBook, updateBook } from '../src/actions/book';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    book: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    category: {
      upsert: vi.fn(),
      update: vi.fn(),
    }
  },
}));

vi.mock('@/lib/r2', () => ({
  r2: { send: vi.fn() },
}));
vi.mock('@aws-sdk/client-s3', () => ({
  DeleteObjectCommand: vi.fn(),
}));
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

describe('deleteBook Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Limpa a memória dos mocks entre um teste e outro
    process.env.R2_BUCKET_NAME = 'test-bucket';
  });

  it('deve bloquear (throw Error) se o usuário não estiver logado', async () => {
    // Simula o Clerk respondendo que não tem ninguém logado (Retorna Null/undefined)
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);

    // Tenta deletar e espera que a Ação dê erro com a mensagem "Unauthorized"
    await expect(deleteBook('livro123')).rejects.toThrow('Unauthorized');
  });

  it('deve bloquear se o livro não existir no banco de dados', async () => {
    // Simula um usuário logado
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    
    // Simula o banco não encontrando o livro (Retorna Null)
    vi.mocked(prisma.book.findUnique).mockResolvedValue(null);

    await expect(deleteBook('livro_inexistente')).rejects.toThrow('Book not found');
  });

  it('deve bloquear se o usuário tentar deletar o livro de OUTRA pessoa (Tentativa de Fraude)', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_hacker' } as any);
    
    // O banco encontra o livro, mas o ID do dono gravado no DB é o 'user_real'
    vi.mocked(prisma.book.findUnique).mockResolvedValue({
      id: 'livro123',
      userId: 'user_real',
    } as any);

    // Executamos e esperamos que a nossa verificação de segurança o expulse
    await expect(deleteBook('livro123')).rejects.toThrow('You can only delete your own books');
    
    // Garantimos que o comando de deletar do Prisma NUNCA foi chamado
    expect(prisma.book.delete).not.toHaveBeenCalled();
  });

  it('deve deletar com sucesso se o livro for do próprio usuário', async () => {
    // Sou o dono do livro
    vi.mocked(auth).mockResolvedValue({ userId: 'user_real' } as any);
    
    // O banco encontra o livro e o dono bate com a autenticação
    vi.mocked(prisma.book.findUnique).mockResolvedValue({
      id: 'livro123',
      userId: 'user_real',
      coverUrl: 'http://aws/cover.jpg',
      pdfUrl: 'http://aws/livro.pdf'
    } as any);

    const resultado = await deleteBook('livro123');

    // Verifica se retornou { success: true }
    expect(resultado).toEqual({ success: true });
    
    // Verifica se a função de deletar no banco foi REALMENTE ativada
    expect(prisma.book.delete).toHaveBeenCalledWith({ where: { id: 'livro123' }});
  });
});

describe("updateBook Server Action", () => {

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.R2_BUCKET_NAME = 'test-bucket';
  })

  it('deve bloquear se o usuário não estiver logado', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any); 
    await expect(updateBook('livro123', new FormData())).rejects.toThrow('Unauthorized');
  });

  it("deve bloquear se o livro não existir no banco de dados", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_1' } as any);
    vi.mocked(prisma.book.findUnique).mockResolvedValue(null);
    await expect(updateBook('livro_inexistente', new FormData())).rejects.toThrow('Book not found');
  });

  it("deve bloquear se o usuário tentar atualizar o livro de OUTRA pessoa (Tentativa de Fraude)", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_hacker' } as any);
    vi.mocked(prisma.book.findUnique).mockResolvedValue({
      id: 'livro123',
      userId: 'user_real',
    } as any);
    await expect(updateBook('livro123', new FormData())).rejects.toThrow('Você só pode editar seus próprios livros.');
    expect(prisma.book.update).not.toHaveBeenCalled();
  });

  it("deve atualizar com sucesso se o livro for do próprio usuário", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_real' } as any);
    vi.mocked(prisma.category.upsert).mockResolvedValue({
      id: 'livro123'
    } as any);

    const formData = new FormData();
    formData.append("title", "Novo Título");
    formData.append("author", "Novo Autor");
    formData.append("summary", "");

    const resultado = await updateBook('livro123', formData);
    expect(resultado).toEqual({ success: true });
    expect(prisma.book.update).toHaveBeenCalledWith({ where: { id: 'livro123' }, data: { title: "Novo Título", author: "Novo Autor", summary: null, categoryId: null }});
  });

  it("deve bloquear se não tiver título ou autor", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user_real' } as any);

    const formData = new FormData();
    formData.append("title", "");
    formData.append("author", "");
    await(expect(updateBook("livro123", formData))).rejects.toThrow("Título e autor são obrigatórios.");
  });


});