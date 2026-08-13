"use client";

import { deleteService } from "./actions";

export function DeleteServiceButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  return (
    <form
      action={deleteService}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${title}" permanently? To hide it temporarily, untick Active instead.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-xs text-stone transition-colors hover:text-hibiscus-deep">Delete</button>
    </form>
  );
}
