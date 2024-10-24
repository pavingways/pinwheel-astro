#!/bin/bash

CURRENT_DIR=$(dirname "$0")
OLD_REPO_DIR="$CURRENT_DIR/../../pavingways.github.io"
NEW_BLOG_DIR="$CURRENT_DIR/../src/content/blog"
NEW_PUBLIC_DIR="$CURRENT_DIR/../public"

for file in "$OLD_REPO_DIR"/*.html; do
  case "$(basename "$file")" in
    "404.html"|"index.html"|"datenschutz.html"|"impressum.html"|"imprint.html"|"rocco.html")
      continue
      ;;
  esac
  ORIGINAL_FILENAME=$(basename "$file")
  TITLE=$(sed -n 's:.*<title>\(.*\)</title>.*:\1:p' "$file" | sed 's/:/ - /g' | sed 's/@/(at)/g' | sed 's/"//g')
  POST_TIME=$(sed -n 's/.*<time datetime="\([^"]*\)".*/\1/p' "$file" | head -n 1)
  CONTENT=$(sed -n 's:.*<div class="entry-content">\([^<]*\)</div>.*:\1:p' "$file")
  IMAGE_URL=$(sed -n 's:.*<div class="entry-content">.*<img src="\([^"]*\)".*:\1:p' "$file")
  IMAGE_URL=${IMAGE_URL:-/images/blog-default.webp}
  NEW_MDX_FILE="$NEW_BLOG_DIR/historic-${ORIGINAL_FILENAME%.html}.mdx"
  REDIRECT_FILE="$NEW_PUBLIC_DIR/$ORIGINAL_FILENAME"

  # Create new .mdx file with frontmatter
  cat <<EOF > "$NEW_MDX_FILE"
---
title: $TITLE
date: $POST_TIME
image: $IMAGE_URL
---
<div class="entry-content">
$CONTENT
</div>
EOF

  # Create redirect HTML file
  cat <<EOF > "$REDIRECT_FILE"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/blog/historic-${ORIGINAL_FILENAME%.html}" />
  <title>Redirecting...</title>
</head>
<body>
<p>If you are not redirected, <a href="/blog/historic-${ORIGINAL_FILENAME%.html}">go to the new location of this post</a>.</p>
</body>
</html>
EOF

done
