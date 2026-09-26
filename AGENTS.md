<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Account state lives in the root AuthProvider backed by Lovable Cloud profile rows; this keeps header/menu auth state consistent across routes.
- Main-view swipes navigate between distinct archive entries, while photo-set swipes navigate only within the active entry; this preserves the archive/gallery distinction.
