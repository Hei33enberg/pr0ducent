# AG — how to report scope of work (repo + release)

- **Commit = proof.** Give a **concrete hash** and **file list** (`git show --name-only <hash>`), not “everything in one commit,” if there were actually several commits or parallel Cursor/Lovable work.
- **Working tree.** Before you say “done / clean,” run `git status` — it should show **no uncommitted changes** if you claim the state is closed on `main`.
- **Main vs local.** State explicitly: “pushed to GitHub `main`” vs “only on my machine / in Lovable preview.”
- **Backend vs frontend.** SQL migrations and Edge Function deploy in Supabase cloud are a **separate step** from a green `vite build`; if you did not deploy migrations, do not say “the database is in sync with the repo.”
