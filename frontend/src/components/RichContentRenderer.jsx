import { FiExternalLink } from 'react-icons/fi';

/* ─────────────────────────────────────────────
   Helper – parse blocks from isi_konten
───────────────────────────────────────────── */
function parseBlocks(value) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.type) return parsed;
  } catch { /* not JSON – legacy plain text */ }
  return null;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ─────────────────────────────────────────────
   RENDERER
───────────────────────────────────────────── */
export default function RichContentRenderer({ content, className = '' }) {
  const blocks = parseBlocks(content);

  // Legacy plain text fallback
  if (!blocks) {
    return (
      <div className={className}>
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base sm:text-lg font-medium">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-content-renderer ${className}`}>
      {blocks.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}
    </div>
  );
}

function RenderBlock({ block }) {
  switch (block.type) {
    case 'paragraph':
      return block.content ? (
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg font-medium mb-4 whitespace-pre-wrap">
          {block.content}
        </p>
      ) : null;

    case 'heading':
      return block.level === 3 ? (
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 mt-8 tracking-tight">
          {block.content}
        </h3>
      ) : (
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4 mt-10 tracking-tight">
          {block.content}
        </h2>
      );

    case 'image':
      return block.src ? (
        <figure className="my-6">
          <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800">
            <img
              src={block.src}
              alt={block.caption || ''}
              className="w-full max-h-[70vh] object-contain mx-auto"
              loading="lazy"
            />
          </div>
          {block.caption && (
            <figcaption className="text-center text-sm text-slate-400 dark:text-slate-500 mt-3 italic font-medium">
              {block.caption}
            </figcaption>
          )}
        </figure>
      ) : null;

    case 'youtube': {
      const videoId = extractYouTubeId(block.url);
      return videoId ? (
        <div className="my-6 rounded-2xl overflow-hidden bg-black shadow-lg">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video"
              loading="lazy"
            />
          </div>
        </div>
      ) : null;
    }

    case 'list':
      if (!block.items || block.items.length === 0) return null;
      return block.style === 'ordered' ? (
        <ol className="list-decimal list-inside space-y-2 my-4 pl-2 text-slate-700 dark:text-slate-300 text-base sm:text-lg font-medium">
          {block.items.map((item, j) => item ? <li key={j}>{item}</li> : null)}
        </ol>
      ) : (
        <ul className="list-disc list-inside space-y-2 my-4 pl-2 text-slate-700 dark:text-slate-300 text-base sm:text-lg font-medium">
          {block.items.map((item, j) => item ? <li key={j}>{item}</li> : null)}
        </ul>
      );

    case 'quote':
      return block.content ? (
        <blockquote className="my-6 border-l-4 border-blue-500 dark:border-blue-400 pl-5 py-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-r-xl italic text-slate-600 dark:text-slate-300 text-base sm:text-lg font-medium">
          {block.content}
        </blockquote>
      ) : null;

    case 'divider':
      return <hr className="my-8 border-t-2 border-slate-100 dark:border-zinc-800" />;

    default:
      return null;
  }
}
