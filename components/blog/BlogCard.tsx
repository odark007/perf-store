import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight } from 'lucide-react';
import { BlogPost } from '@/lib/types';

interface Props {
  post: BlogPost;
}

const BlogCard: React.FC<Props> = ({ post }) => {
  const date = new Date(post.published_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-secondary-100 shadow-sm hover:shadow-md transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-secondary-100 overflow-hidden">
          <Image 
            src={post.cover_image_url || 'https://placehold.co/600x400/png?text=No+Image'} 
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs text-secondary-500 mb-3">
            <Calendar size={14} />
            <span>{date}</span>
          </div>

          <h3 className="text-xl font-display font-bold text-secondary-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-secondary-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 text-sm font-bold text-primary-600 group-hover:gap-3 transition-all">
            Read Article <ArrowRight size={16} />
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogCard;