import Link from "next/link";
import { products } from "../../../data/demo";

export default function CategoryPage() {
  const filteredProducts = products.filter(
    (item) =>
      item.ageGroup === "newborn" &&
      item.gender === "boy" &&
      item.tags.includes("blankets")
  );

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div>
        <h1
          className="text-3xl sm:text-4xl"
          style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, color: "var(--foreground)" }}
        >
          Boys Newborns - Blankets
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>
          Demo listing for Boys Newborns in Blankets.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredProducts.map((product) => (
          <Link key={product.id} href={"/newborns/boys/blankets/" + product.id} className="block cursor-pointer group">
          <article
            className="rounded-2xl border overflow-hidden transition-shadow group-hover:shadow-lg"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2
                className="text-lg leading-tight"
                style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 700, color: "var(--foreground)" }}
              >
                {product.name}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>
                {product.category}
              </p>
              <p className="mt-3 text-base font-semibold" style={{ color: "var(--primary)", fontFamily: "'DM Sans', sans-serif" }}>
                PKR {product.price}
              </p>
            </div>
          </article>
          </Link>
        ))}
      </div>
    </section>
  );
}