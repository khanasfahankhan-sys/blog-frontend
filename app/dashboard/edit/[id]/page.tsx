"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import { api, clearAuth, ApiError, Post } from "@/lib/api";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPost(id)
      .then(setPost)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          clearAuth();
          router.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "Failed to load post");
      });
  }, [id, router]);

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold text-gray-900">Edit post</h1>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {!post && !error && (
        <p className="text-sm text-gray-500">Loading post…</p>
      )}
      {post && (
        <PostEditor
          slug={post.slug}
          initialTitle={post.title}
          initialContent={post.content}
        />
      )}
    </div>
  );
}
