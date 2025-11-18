import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface PageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default async function MePage({ params }: PageProps) {
  const { handle } = await params;
  let card;
  try {
    card = await apiClient.getCard(handle);
  } catch (error) {
    notFound();
  }

  const sections = card.card.sections;

  return (
    <div className="min-h-screen bg-cc-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-cc-text mb-2">
            {card.card.name || card.card.handle}
          </h1>
          <p className="text-cc-text-muted">@{card.card.handle}</p>
          <a
            href={`/me/${handle}/card.json`}
            className="inline-block mt-4 text-sm text-cc-violet hover:underline"
          >
            Machine manifest (card.json)
          </a>
        </header>

        {sections.creations && sections.creations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Creations</h2>
            <div className="space-y-4">
              {sections.creations.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {sections.collabs && sections.collabs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Collaborations</h2>
            <div className="space-y-4">
              {sections.collabs.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {sections.inspired && sections.inspired.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Inspired By</h2>
            <div className="space-y-4">
              {sections.inspired.map((item: any) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {sections.capabilities && sections.capabilities.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {sections.capabilities.map((cap: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-cc-surface border border-cc-border text-sm text-cc-text"
                >
                  {cap}
                </span>
              ))}
            </div>
          </section>
        )}

        {card.card.links && card.card.links.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-cc-text mb-4">Links</h2>
            <div className="space-y-2">
              {card.card.links.map((link: any, i: number) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-cc-violet hover:underline"
                >
                  {link.title}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: any }) {
  const authorshipColors: Record<string, string> = {
    mine: 'bg-teal-100 text-teal-800 border-teal-300',
    collab: 'bg-blue-100 text-blue-800 border-blue-300',
    remix: 'bg-purple-100 text-purple-800 border-purple-300',
    inspired: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  return (
    <div className="p-4 rounded-lg border border-cc-border bg-cc-surface">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-cc-text">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h3>
        <span
          className={`px-2 py-1 rounded text-xs font-medium border ${authorshipColors[item.authorship] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
        >
          {item.authorship}
        </span>
      </div>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {item.tags.map((tag: string, i: number) => (
            <span key={i} className="text-xs text-cc-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

