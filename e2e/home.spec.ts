import { test, expect } from '@playwright/test';

test.describe("Libwise E2E - Funcionalidades Principais", () => {
  
  test("deve carregar a página inicial e exibir a barra superior", async ({ page }) => {
    // 1. Acessamos a raiz do projeto
    await page.goto("/");
    
    // 2. Verificamos se o Header principal está na tela
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // 3. Verificamos se o nome do App aparece
    await expect(page.locator("text=Libwise").first()).toBeVisible();
  });

  test("a busca global deve funcionar exibindo estado de 'Nenhum livro' para absurdos", async ({ page, isMobile }) => {
    // Ignoramos a busca por barra central se for celular (pois no mobile a lupa abre um modal)
    if (isMobile) {
      test.skip();
      return;
    }
    
    await page.goto("/");
    
    // Localiza o input de busca (aquele com o placeholder)
    const searchInput = page.getByPlaceholder("Buscar livros, autores...").first();
    await expect(searchInput).toBeVisible();

    // Digita um título fictício para forçar a renderização do estado vazio
    await searchInput.fill("TermoAbsurdoQueNaoExiste123");
    
    // O seu componente SearchBar.tsx espera 300ms de debounce e dps chama searchBooks.
    // Como a biblioteca do Playwright é inteligente, o texto vai aparecer na tela EVENTUALMENTE (auto-espera por até 5s).
    const emptyState = page.getByText(/Nenhum livro encontrado/i);
    await expect(emptyState).toBeVisible({ timeout: 5000 });
  });

  test("a busca mobile deve abrir o modal correspondente", async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
      return;
    }

    await page.goto("/");
    
    // Procura o botão de lupa que (md:hidden) deve estar visível no mobile
    const searchTrigger = page.locator("button[aria-label='Buscar']");
    await searchTrigger.click();

    // O input do modal da MobileSearch deve estar presente e focado (ou, pelo menos, visível)
    const searchInput = page.getByPlaceholder("Buscar livros, autores...");
    await expect(searchInput).toBeVisible();
  });
});
