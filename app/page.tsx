"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, getToken, Post } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import TagFilter from "@/components/TagFilter";

function excerpt(content: string, maxLength = 160): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength)}…` : plain;
}

function authorName(post: Post): string {
  return typeof post.author === "string" ? "" : post.author.username;
}

function Feed() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const tag = searchParams.get("tag") ?? "";

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(getToken()));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    api
      .listPublicPosts({ search: search || undefined, tag: tag || undefined })
      .then((data) => {
        if (!cancelled) setPosts(data.posts);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load posts");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [search, tag]);

  const tags = useMemo(() => {
    const all = new Set<string>(tag ? [tag] : []);
    posts?.forEach((post) => post.tags.forEach((t) => all.add(t)));
    return Array.from(all).sort();
  }, [posts, tag]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Blog</h1>
        <Link
          href={loggedIn ? "/dashboard" : "/login"}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {loggedIn ? "Dashboard" : "Log in"}
        </Link>
      </div>

      <div className="mb-6 space-y-3">
        <SearchBar />
        <TagFilter tags={tags} />
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {posts === null && !error && (
        <p className="text-sm text-gray-500">Loading posts…</p>
      )}

      {posts?.length === 0 && (
        <p className="text-sm text-gray-500">No posts found.</p>
      )}

      <ul className="space-y-4">
        {posts?.map((post) => (
          <li
            key={post._id}
            className="rounded-lg border border-gray-200 bg-white px-4 py-4"
          >
            <Link
              href={`/blog/${post.slug}`}
              className="text-base font-semibold text-gray-900 hover:underline"
            >
              {post.title}
            </Link>
            <p className="mt-1 text-xs text-gray-500">
              {authorName(post) && <>{authorName(post)} · </>}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
            {post.tags.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1.5">
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
            {excerpt(post.content) && (
              <p className="mt-2 text-sm text-gray-600">
                {excerpt(post.content)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <Feed />
    </Suspense>
  );
}
