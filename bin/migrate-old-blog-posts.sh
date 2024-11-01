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
  TITLE=$(sed -n 's:.*<title>\(.*\)</title>.*:\1:p' "$file" | sed 's/:/ - /g' | sed 's/@/(at)/g' | sed 's/"//g' | sed 's/ - PavingWays JavaScript Applications//g')
  POST_TIME=$(sed -n 's/.*<time datetime="\([^"]*\)".*/\1/p' "$file" | head -n 1)
  AUTHOR=$(sed -n 's/.*  <meta name="author" content="\([^"]*\)".*/\1/p' "$file" | head -n 1)
  AUTHOR=${AUTHOR:-Diana/Rocco}
CONTENT=$(awk '
/<div class="entry-content">/ {in_div=1}
in_div && !/<footer>/ {
  gsub(/<p>/, "\n<p>")
  gsub(/&#8211;/, "–")
  gsub(/&#8212;/, "—")
  gsub(/&#8216;/, "\‘")
  gsub(/&#8217;/, "\’")
  gsub(/&#8220;/, "“")
  gsub(/&#8221;/, "”")
  gsub(/&#8230;/, "...")
  gsub(/<a[^>]*>/, "")
  gsub(/<\/a>/, "")
  gsub(/<pre><code>/, "```\n")
  gsub(/<\/code><\/pre>/, "\n```")
  gsub(/<code>/, "`")
  gsub(/<\/code>/, "`")
  gsub(/<pre>/, "")
  gsub(/<\/pre>/, "")
  gsub(/<\/strong><strong>/, "** **")
  gsub(/<strong> /, "**")
  gsub(/<strong>/, "**")
  gsub(/\r?\n<\/strong>/, "**")
  gsub(/<\/strong>/, "** ")
  gsub(/ <\/strong>/, "** ")
  gsub(/<br>/, "\n")
  gsub(/ /, " ")
  gsub(/<div[^>]*>/, "&\n")
  gsub(/<p[^>]*>/, "&\n")
  gsub(/<\/p>/, "\n&")
  gsub(/<!--more-->/, "")
  gsub(/\*\*\*\*/, "")
  gsub(/www./, "")
  gsub(/src=\"http:\/\//, "src=\"kcct:\/\/")
  gsub(/src=\"https:\/\//, "src=\"kccts:\/\/")
  gsub(/http:\/\//, "")
  gsub(/https:\/\//, "")
  gsub(/src=\"kcct:\/\//, "src=\"http:\/\/")
  gsub(/src=\"kccts:\/\//, "src=\"https:\/\/")
  print
  if (/<\/div>/) { in_div=0 }
}' "$file")
  _DEL_IMAGE_URL=$(sed -n 's:.*<div class="entry-content">.*<img src="\([^"]*\)".*:\1:p' "$file")
  IMAGE_URL=${IMAGE_URL:-/images/blog-default.webp}
  NEW_MDX_FILE="$NEW_BLOG_DIR/${ORIGINAL_FILENAME%.html}.mdx"
  REDIRECT_FILE="$NEW_PUBLIC_DIR/$ORIGINAL_FILENAME"
  LANGUAGE=$(sed -n 's/.*<html[^>]* lang="\([^"]*\)".*/\1/p' "$file" | head -n 1)
  LANGUAGE=${LANGUAGE:-Diana/Rocco}
  # Create new .mdx file with frontmatter
  cat <<EOF > "$NEW_MDX_FILE"
---
title: $TITLE
date: $POST_TIME
image: $IMAGE_URL
categories: [mobile, historic]
author: $AUTHOR
featured: false
language: $LANGUAGE
---

$CONTENT

EOF

  # Create redirect HTML file
  cat <<EOF > "$REDIRECT_FILE"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=/blog/${ORIGINAL_FILENAME%.html}" />
  <title>Redirecting...</title>
</head>
<body>
<p>If you are not redirected, <a href="/blog/${ORIGINAL_FILENAME%.html}">go to the new location of this post</a>.</p>
</body>
</html>
EOF

done
