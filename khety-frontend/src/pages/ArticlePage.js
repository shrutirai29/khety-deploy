import { useParams, useNavigate } from "react-router-dom";
import articles from "../data/articles";

function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const article = articles[id];

  if (!article) {
    return <div className="p-10 text-center">Article not found</div>;
  }

  return (
    <div className="min-h-screen bg-green-50">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="m-6 px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        ← Back
      </button>

      {/* HERO IMAGE */}
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

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto p-6 text-lg text-gray-700 leading-relaxed whitespace-pre-line">
  {article.content}
</div>

    </div>
  );
}

export default ArticlePage;