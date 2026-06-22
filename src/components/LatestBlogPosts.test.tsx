import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

type MockPost = {
  slug: string;
  trade: string;
  city: string;
  brand: string;
  category: string;
  date: string;
  image: string;
  pain: string;
  excerpt?: string;
};

const mockPosts: MockPost[] = [];

vi.mock("@/data/blogPosts", () => ({
  get blogPosts() {
    return mockPosts;
  },
}));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get:
        () =>
        ({ children, ...rest }: { children?: React.ReactNode }) =>
          <article {...rest}>{children}</article>,
    },
  ),
}));

const makePost = (overrides: Partial<MockPost> & { slug: string; date: string }): MockPost => ({
  trade: "Trade",
  city: "City",
  brand: "Brand",
  category: "Cat",
  image: "/x.jpg",
  pain: "p",
  excerpt: "e",
  ...overrides,
});

const setPosts = (posts: MockPost[]) => {
  mockPosts.splice(0, mockPosts.length, ...posts);
};

const renderCarousel = async () => {
  const { default: LatestBlogPosts } = await import("./LatestBlogPosts");
  return render(
    <MemoryRouter>
      <LatestBlogPosts />
    </MemoryRouter>,
  );
};

const renderedSlugs = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("article a[href^='/blog/']"))
    .map((a) => a.getAttribute("href")!.replace("/blog/", ""))
    .filter((slug, i, arr) => arr.indexOf(slug) === i);

describe("LatestBlogPosts homepage carousel", () => {
  beforeEach(() => {
    cleanup();
    vi.resetModules();
  });

  it("sorts strictly by newest 'Month Year' date first", async () => {
    setPosts([
      makePost({ slug: "old", date: "January 2024" }),
      makePost({ slug: "mid", date: "August 2025" }),
      makePost({ slug: "newest", date: "March 2026" }),
      makePost({ slug: "older", date: "December 2023" }),
      makePost({ slug: "recent", date: "November 2025" }),
    ]);
    const { container } = await renderCarousel();
    expect(renderedSlugs(container)).toEqual(["newest", "recent", "mid", "old"]);
  });

  it("limits to 4 posts even when many are available", async () => {
    setPosts(
      Array.from({ length: 10 }, (_, i) =>
        makePost({ slug: `p-${i}`, date: `June ${2020 + i}` }),
      ),
    );
    const { container } = await renderCarousel();
    const slugs = renderedSlugs(container);
    expect(slugs).toHaveLength(4);
    expect(slugs).toEqual(["p-9", "p-8", "p-7", "p-6"]);
  });

  it("breaks ties on identical dates by source order, newest insertion wins", async () => {
    // Three posts share the newest date. Later array index = added more recently.
    setPosts([
      makePost({ slug: "tie-a", date: "June 2026" }),
      makePost({ slug: "older", date: "May 2026" }),
      makePost({ slug: "tie-b", date: "June 2026" }),
      makePost({ slug: "tie-c", date: "June 2026" }),
      makePost({ slug: "oldest", date: "January 2026" }),
    ]);
    const { container } = await renderCarousel();
    // Among the June 2026 trio, highest index (tie-c) comes first, then tie-b, tie-a.
    expect(renderedSlugs(container)).toEqual(["tie-c", "tie-b", "tie-a", "older"]);
  });

  it("applies tie-break rule consistently regardless of input order", async () => {
    const base = [
      makePost({ slug: "a", date: "June 2026" }),
      makePost({ slug: "b", date: "June 2026" }),
      makePost({ slug: "c", date: "May 2026" }),
      makePost({ slug: "d", date: "May 2026" }),
    ];
    setPosts(base);
    const first = await renderCarousel();
    const order1 = renderedSlugs(first.container);
    cleanup();
    vi.resetModules();
    // Same posts, identical insertion order → identical ranking.
    setPosts([...base]);
    const second = await renderCarousel();
    expect(renderedSlugs(second.container)).toEqual(order1);
    // And the rule itself: later index wins on tie.
    expect(order1).toEqual(["b", "a", "d", "c"]);
  });

  it("treats unparseable dates as the oldest (excluded when newer posts exist)", async () => {
    setPosts([
      makePost({ slug: "broken", date: "sometime" }),
      makePost({ slug: "one", date: "January 2025" }),
      makePost({ slug: "two", date: "February 2025" }),
      makePost({ slug: "three", date: "March 2025" }),
      makePost({ slug: "four", date: "April 2025" }),
    ]);
    const { container } = await renderCarousel();
    const slugs = renderedSlugs(container);
    expect(slugs).not.toContain("broken");
    expect(slugs).toEqual(["four", "three", "two", "one"]);
  });
});