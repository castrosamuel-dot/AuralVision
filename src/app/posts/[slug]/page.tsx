import { getPostBySlug } from "@/lib/posts";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-10 text-center">
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-500 mb-4">
          <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span>&bull;</span>
          <time dateTime={new Date(post.createdAt).toISOString()}>
            {format(new Date(post.createdAt), 'MMMM d, yyyy')}
          </time>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-6">
          {post.title}
        </h1>
        <div className="flex justify-center items-center">
             <div className="text-sm font-medium text-gray-900">
                By {post.author}
             </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="mb-10 rounded-lg overflow-hidden shadow-lg">
           {/* <img src={post.coverImage} alt={post.title} className="w-full object-cover" /> */}
        </div>
      )}

      <div className="prose prose-lg prose-blue mx-auto text-gray-700">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
