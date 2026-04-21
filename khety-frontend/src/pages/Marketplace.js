import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const buildProductFallbackImage = (product) => {
  const title = encodeURIComponent(product.name || "Marketplace Product");
  const subtitle = encodeURIComponent(product.category || "Khety");

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="%23e8f1e4"/><stop offset="1" stop-color="%23f7f4eb"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23g)"/><circle cx="930" cy="180" r="140" fill="%23d3e4cf"/><circle cx="260" cy="650" r="180" fill="%23eef4ea"/><rect x="120" y="120" width="960" height="560" rx="42" fill="%23ffffff" fill-opacity="0.86"/><text x="600" y="315" text-anchor="middle" font-family="Arial, sans-serif" font-size="68" font-weight="700" fill="%23102217">${title}</text><text x="600" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" fill="%238a5b21">${subtitle}</text><text x="600" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="%235e6b62">Image unavailable, product card fallback</text></svg>`;
};

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setMessage("");
      const productsData = await apiFetch("/api/products");
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      setMessage(err.message || "Unable to load marketplace products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = ["all", ...new Set(products.map((item) => item.category).filter(Boolean))];
  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const haystack = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    const matchesSearch = haystack.includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[36px] border border-[#dbe3d9] bg-[radial-gradient(circle_at_top_left,_rgba(216,229,215,0.9),_rgba(255,255,255,0.96)_55%)] p-8 shadow-[0_20px_60px_rgba(16,34,23,0.06)]">
          <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#8a5b21]">
                Admin Curated Inputs Marketplace
              </p>
              <h1 className="mt-5 text-4xl font-extrabold text-[#102217]">
                Seeds, fertilizers, and crop supplies visible in one place.
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
                Products are added by admin for now. Users can browse available supplies here.
              </p>
            </div>

            <div className="rounded-3xl border border-white/70 bg-white/80 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a5b21]">
                Live products
              </p>
              <p className="mt-2 text-3xl font-bold text-[#102217]">{filteredProducts.length}</p>
            </div>
          </div>
        </section>

        {message ? (
          <div className="rounded-2xl border border-[#e6ded1] bg-[#fff7ec] px-4 py-3 text-sm text-[#8a5b21]">
            {message}
          </div>
        ) : null}

        <section className="rounded-[32px] border border-[#dbe3d9] bg-white p-5 shadow-[0_20px_60px_rgba(16,34,23,0.05)]">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product, category, or description"
              className="w-full rounded-2xl border border-[#d6ded3] bg-[#fbfcfa] px-4 py-3 text-sm text-[#102217] outline-none transition focus:border-[#215732]"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-[#d6ded3] bg-[#fbfcfa] px-4 py-3 text-sm text-[#102217] outline-none transition focus:border-[#215732]"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All categories" : item}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <section className="rounded-[32px] border border-[#dbe3d9] bg-white px-6 py-12 text-center text-sm text-[#5e6b62] shadow-[0_20px_60px_rgba(16,34,23,0.05)]">
            Loading products...
          </section>
        ) : filteredProducts.length === 0 ? (
          <section className="rounded-[32px] border border-[#dbe3d9] bg-white px-6 py-12 text-center text-sm text-[#5e6b62] shadow-[0_20px_60px_rgba(16,34,23,0.05)]">
            No products match your current search.
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-[30px] border border-[#dbe3d9] bg-white shadow-[0_18px_50px_rgba(16,34,23,0.05)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(16,34,23,0.08)]"
              >
                <img
                  src={product.image || buildProductFallbackImage(product)}
                  alt={product.name}
                  className="h-56 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = buildProductFallbackImage(product);
                  }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#8a5b21]">
                        {product.category}
                      </p>
                      <h2 className="mt-3 text-2xl font-bold text-[#102217]">{product.name}</h2>
                      <p className="mt-2 text-sm text-[#5e6b62]">
                        {product.sku || "Admin product"} • {product.unitLabel || "unit"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#eef4ee] px-3 py-2 text-sm font-semibold text-[#215732]">
                      Rs. {product.price}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[#5e6b62]">
                    {product.description}
                  </p>

                  <div className="mt-6 rounded-3xl bg-[#f6f8f3] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a5b21]">
                      Available stock
                    </p>
                    <p className="mt-1 text-sm text-[#5e6b62]">
                      {product.stock ?? 0} {product.unitLabel || "units"} available
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default Marketplace;
