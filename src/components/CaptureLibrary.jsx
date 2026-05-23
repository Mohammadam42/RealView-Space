import { Image, Trash2 } from 'lucide-react';

function formatTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ar-JO', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function CaptureLibrary({
  items,
  selectedId,
  onSelect,
  onDelete,
  emptyLabel,
  renderMeta,
}) {
  return (
    <section className="library-panel">
      <div className="panel-heading">
        <h2>المحفوظات</h2>
        <span className="count-pill">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <Image size={30} />
          <span>{emptyLabel}</span>
        </div>
      ) : (
        <div className="library-list">
          {items.map((item) => (
            <article
              key={item.id}
              className={item.id === selectedId ? 'library-item active' : 'library-item'}
              onClick={() => onSelect(item.id)}
            >
              <img src={item.imageData} alt={item.title} />
              <div>
                <strong>{item.title}</strong>
                <span>{formatTime(item.createdAt)}</span>
                {renderMeta?.(item)}
              </div>
              <button
                type="button"
                className="delete-button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(item.id);
                }}
                aria-label="حذف"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
