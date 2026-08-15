"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function TagFilter({ tags }: { tags: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  if (tags.length === 0) return null;

  function selectTag(tag: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === activeTag) {
      params.delete("tag");
    } else {
      params.set("tag", tag);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => selectTag(tag)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            tag === activeTag
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
