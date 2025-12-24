import { getPublishedPosts } from "@/lib/posts";
import Link from "next/link";
import { format } from "date-fns";

export default async function Home() {
  const posts = await getPublishedPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="text-center mb-16">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-green-400 sm:text-5xl md:text-6xl">
          Latest from AuralVision
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-green-800 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          News, reviews, and insights on the world of Event AV and Technology.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-lg dark:border dark:border-green-800">
          <p className="text-gray-500 dark:text-green-600 text-lg">No posts yet. Check back soon!</p>
          <p className="text-gray-400 dark:text-green-900 text-sm mt-2">(Or log in to Admin to create one)</p>
        </div>
      ) : (
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-12">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-col rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-green-900 hover:shadow-md transition-all dark:bg-black dark:hover:border-green-500">
               {/* Placeholder for cover image if we had one */}
               {post.coverImage && (
                 <div className="flex-shrink-0 h-48 w-full bg-gray-200 dark:bg-green-900">
                    {/* <img className="h-48 w-full object-cover" src={post.coverImage} alt="" /> */}
                 </div>
               )}
              <div className="flex-1 bg-white dark:bg-black p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-600 dark:text-green-400">
                    <Link href={`/category/${post.category.toLowerCase().replace(' ', '-')}`} className="hover:underline">
                      {post.category}
                    </Link>
                  </p>
                  <Link href={`/posts/${post.slug}`} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900 dark:text-green-500">{post.title}</p>
                    <p className="mt-3 text-base text-gray-500 dark:text-green-800 line-clamp-3 font-sans dark:font-mono">{post.excerpt}</p>
                  </Link>
                </div>
                <div className="mt-6 flex items-center">
                  <div className="flex-shrink-0">
                    <span className="sr-only">{post.author}</span>
                  </div>
                  <div className="">
                    <p className="text-sm font-medium text-gray-900 dark:text-green-600">
                      {post.author}
                    </p>
                    <div className="flex space-x-1 text-sm text-gray-500 dark:text-green-900">
                      <time dateTime={new Date(post.createdAt).toISOString()}>
                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}