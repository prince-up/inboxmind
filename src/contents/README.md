# Content-script entry points

Plasmo treats every TypeScript or TSX file in this directory as an executable
content-script entry point. Commit #2 introduces the Gmail-scoped entry with an
explicit `https://mail.google.com/*` match configuration.

Do not add barrel files to this directory because Plasmo would bundle them as
independent content scripts.
