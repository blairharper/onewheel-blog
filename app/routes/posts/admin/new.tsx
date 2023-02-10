import { Form, useActionData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/server-runtime";
import { createPost } from "~/models/post.server";

export const action = async ({ request }: ActionArgs) => {
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

  await createPost({ title, slug, markdown });

  return redirect("/posts/admin");
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50";

export default function NewPostRoute() {
  const errors = useActionData();
  return (
    <Form method="post">
      <p>
        <label htmlFor="title">
          Title:
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
        </label>
        <input type="text" name="title" id="title" className={inputClassName} />
      </p>
      <p>
        <label htmlFor="slug">
          Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
        </label>
        <input type="text" name="slug" id="slug" className={inputClassName} />
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
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-800"
        >
          Save
        </button>
      </p>
    </Form>
  );
}
