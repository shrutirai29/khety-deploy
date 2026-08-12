import { useParams, useNavigate } from "react-router-dom";
import articles from "../data/articles";
import Breadcrumbs from "../components/Breadcrumbs";

function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const index = Number(id);
  const article = articles[index];

  if (!article) {
    return <div className="p-10 text-center">Article not found</div>;
  }

  const related = articles
    .map((item, itemIndex) => ({ item, itemIndex }))
    .filter(({ itemIndex }) => itemIndex !== index)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-green-50">

      <div className="px-6 pt-6 md:px-10">
        <div className="mx-auto max-w-3xl">
          <Breadcrumbs
            items={[
              { to: "/", label: "Resources" },
              { label: article.title.split(" ").slice(0, 6).join(" ") + "…" }
            ]}
          />
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="m-6 px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        ← Back
      </button>

      <div
        className="h-[50vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${article.image})` }}
      >
        <div className="bg-black/60 w-full h-full flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold text-center px-6">
            {article.title}
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
        {article.content}
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-10">
        <div className="rounded-3xl border border-green-200 bg-white p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            Keep learning
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map(({ item, itemIndex }) => (
              <button
                key={item.title}
                onClick={() => {
                  navigate(`/article/${itemIndex}`);
                  window.scrollTo({ top: 0 });
                }}
                className="rounded-2xl border border-green-200 bg-green-50 p-4 text-left transition hover:border-green-400"
              >
                <p className="text-sm font-bold text-green-900">{item.title}</p>
                <p className="mt-2 text-xs text-green-700">Read article →</p>
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-600">
            Want hands-on help?{" "}
            <button
              onClick={() => navigate("/detect")}
              className="font-semibold text-green-700 underline"
            >
              Run a disease scan
            </button>{" "}
            or{" "}
            <button
              onClick={() => navigate("/marketplace")}
              className="font-semibold text-green-700 underline"
            >
              browse verified inputs
            </button>.
          </p>
        </div>
      </div>

    </div>
  );
}

export default ArticlePage;
