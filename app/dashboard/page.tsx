"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, authorId, clearAuth, getUser, ApiError, Post } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const all = await api.listPosts();
      const me = getUser();
      setPosts(me ? all.filter((p) => authorId(p) === me.id) : all);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load posts");
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(slug: string) {
    setDeletingSlug(slug);
    setError(null);
    try {
      await api.deletePost(slug);
      setPosts((prev) => prev?.filter((p) => p.slug !== slug) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Posts</h1>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
        >
          New post
        </Link>
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
        <p className="text-sm text-gray-500">
          No posts yet. Create your first one.
        </p>
      )}

      <ul className="space-y-3">
        {posts?.map((post) => (
          <li
            key={post._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {post.title}
              </p>
              <p className="text-xs text-gray-500">
                {post.published ? "Published" : "Draft"} · Updated{" "}
                {new Date(post.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-4 flex shrink-0 gap-3">
              <Link
                href={`/dashboard/edit/${post.slug}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.slug)}
                disabled={deletingSlug === post.slug}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deletingSlug === post.slug ? "Deleting…" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
