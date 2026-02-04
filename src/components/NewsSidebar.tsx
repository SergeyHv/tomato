import React from 'react';
import { Newspaper } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsSidebarProps {
  news: NewsItem[];
}

export const NewsSidebar: React.FC<NewsSidebarProps> = ({ news }) => {
  return (
    <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-2">
        <Newspaper size={18} className="text-tomato-500" />
        <h2 className="font-bold text-stone-800">News & Tips</h2>
      </div>
      <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
        {news.map((item) => (
          <article key={item.id} className="group">
            <div className="text-xs text-stone-400 mb-1">{item.date}</div>
            <h3 className="font-semibold text-stone-800 mb-1 group-hover:text-tomato-600 transition-colors cursor-pointer">
              {item.title}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {item.summary}
            </p>
          </article>
        ))}
        {news.length === 0 && <p className="text-stone-400 text-sm">No news available.</p>}
      </div>
    </div>
  );
};
