import { Link } from "react-router-dom";

function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-[#6d7a71]">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="transition hover:text-[#215732]">
            Home
          </Link>
        </li>
        {(items || []).map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {item.to && !isLast ? (
                <Link to={item.to} className="transition hover:text-[#215732]">
                  {item.label}
                </Link>
              ) : (
                <span className="font-semibold text-[#102217]">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
