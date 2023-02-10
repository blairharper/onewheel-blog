import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { createPost, getPost, updatePost } from "~/models/post.server";
import invariant from "tiny-invariant";
import { requireAdminUser } from "~/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireAdminUser(request);
  invariant(params.slug, "slug should be defined");
  if (params.slug === "new") {
    return json({});
  }

  const post = await getPost(params.slug);
  if (!post) {
    throw new Response("Not found", { status: 404 });
  }
  return json({ post });
};

export const action = async ({ request, params }: ActionArgs) => {
  await requireAdminUser(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some((error) => error);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title should be a string");
  invariant(typeof slug === "string", "slug should be a string");
  invariant(typeof markdown === "string", "markdown should be a string");
  if (params.slug === "new") {
    await createPost({ title, slug, markdown });
  } else {
    invariant(params.slug, "slug should be defined");
    await updatePost(params.slug, { title, slug, markdown });
  }

  return redirect("/posts/admin");
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50";

export default function NewPostRoute() {
  const data = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isNewPost = !data.post;

  return (
    <Form method="post" key={data.post?.slug ?? "new"}>
      <p>
        <label htmlFor="title">
          Title:
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
        </label>
        <input
          type="text"
          name="title"
          id="title"
          className={inputClassName}
          defaultValue={data.post?.title ?? ""}
        />
      </p>
      <p>
        <label htmlFor="slug">
          Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
        </label>
        <input
          type="text"
          name="slug"
          id="slug"
          className={inputClassName}
          defaultValue={data.post?.slug ?? ""}
        />
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown:{" "}
          {errors?.markdown ? (
            <em className="text-red-600">{errors.markdown}</em>
          ) : null}
        </label>
        <textarea
          name="markdown"
          id="markdown"
          rows={20}
          className={inputClassName}
          defaultValue={data.post?.markdown ?? ""}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          name="intent"
          value={isNewPost ? "create" : "update"}
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-800"
          disabled={isCreating || isUpdating}
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update Post"}
        </button>
      </p>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return <div>Uh oh... this post does not exist.</div>;
  }
  return <div>Uh oh! Something went wrong.</div>;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <div className="text-red-500">{error.message}</div>;
}
