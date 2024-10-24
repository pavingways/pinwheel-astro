#!/bin/bash

# read all .html files from the old repo in CURRENT_DIR/../../pavingways.github.io/*.html
# for each file, extract:
# - file name ORIGINAL_FILENAME
# - title (from title tag)
# - post time (in <time datetime="POST_TIME_HERE"></time>
# - content in <div class="entry-content">CONTENT_HERE</div>
# - image URL (first image tag within the content just extracted)
# then for each file:
# - create a new file in CURRENT_DIR/../src/content/blog/ with the following format: OLD_FILENAME.mdx
# - add the following frontmatter:
# ---
# title: TITLE
# date: POST_TIME
# image: IMAGE_URL
# ---
# add content from CONTENT_HERE in the new file, also between <div class="entry-content">...</div>
# also create a new file in CURRENT_DIR/../src/content/blog/ with the same file name as the original one
# and add the following content:
#<!DOCTYPE html>
#<html lang="en">
#<head>
#  <meta charset="UTF-8">
#  <meta http-equiv="refresh" content="0; url=/blog/historic-OLD_FILENAME(without.html)" />
#  <title>Redirecting...</title>
#</head>
#<body>
#<p>If you are not redirected, <a href="/blog/historic-OLD_FILENAME(without.html)">go to the new location of this post</a>.</p>
#</body>
#</html>

CURRENT_DIR=$(dirname "$0")
OLD_REPO_DIR="$CURRENT_DIR/../../pavingways.github.io"
NEW_BLOG_DIR="$CURRENT_DIR/../src/content/blog"

for file in "$OLD_REPO_DIR"/*.html; do
  ORIGINAL_FILENAME=$(basename "$file")
  TITLE=$(grep -oP '(?<=<title>)(.*)(?=</title>)' "$file")
  POST_TIME=$(grep -oP '(?<=<time datetime=")(.*)(?="></time>)' "$file")
  CONTENT=$(grep -oP '(?<=<div class="entry-content">)(.*)(?=</div>)' "$file")
  IMAGE_URL=$(grep -oP '(?<=<div class="entry-content">.*<img src=")([^"]+)' "$file")

  NEW_FILE="$NEW_BLOG_DIR/${ORIGINAL_FILENAME%.html}.mdx"
  REDIRECT_FILE="$NEW_BLOG_DIR/$ORIGINAL_FILENAME"

  # Create new .mdx file with frontmatter
  cat <<EOF > "$NEW_FILE"
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
