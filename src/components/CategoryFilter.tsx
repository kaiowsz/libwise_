import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId?: string;
}

export default function CategoryFilter({ categories, activeCategoryId }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-10">
      <Link
        href="/"
        className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${
          !activeCategoryId
            ? "bg-[#D1B898] text-black border-[#D1B898] shadow-[0_0_12px_rgba(209,184,152,0.2)]"
            : "text-text-dimmed border-border-dim hover:border-border-glow hover:text-white hover:bg-surface-elevated"
        }`}
      >
        Todos
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/?category=${cat.id}`}
          className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all ${
            activeCategoryId === cat.id
              ? "bg-[#D1B898] text-black border-[#D1B898] shadow-[0_0_12px_rgba(209,184,152,0.2)]"
              : "text-text-dimmed border-border-dim hover:border-border-glow hover:text-white hover:bg-surface-elevated"
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
