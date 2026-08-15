"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { api, ApiError, Post } from "@/lib/api";

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getPublicPost(params.slug)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setError("Post not found");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load post");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
        ← Back to feed
      </Link>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {post === null && !error && (
        <p className="mt-6 text-sm text-gray-500">Loading post…</p>
      )}

      {post && (
        <article className="mt-6">
          <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
          <p className="mt-2 text-xs text-gray-500">
            {typeof post.author !== "string" && (
              <>{post.author.username} · </>
            )}
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
          {post.tags.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                >
                  {t}
                </span>
              ))}
            </p>
          )}
          <div className="markdown mt-6 text-sm text-gray-900">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      )}
    </div>
  );
}
