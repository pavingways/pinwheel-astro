// sort by date
export const sortByDate = (array: any[]) => {
  const sortedArray = array.sort(
    (a: any, b: any) => +new Date(b.data.date) - +new Date(a.data.date)
  );
  return sortedArray;
};

// Splits an already-newest-first sorted post list into the top block shown
// at the head of the blog index and the rest of the (paginated) list below.
//
// Slot 1 is always the single newest post. Slot 2 is the manually flagged
// `featured` post, if one exists, otherwise it falls back to the second-newest
// post — so the top block always shows two posts, featured or not. If more
// than one post is flagged `featured`, only the most recent one takes the
// slot; the others render normally further down the list.
export const splitFeaturedPosts = (sortedPosts: any[]) => {
  const newest = sortedPosts[0];
  const manuallyFeatured = sortedPosts.find(
    (post) => post.data.featured && post !== newest
  );
  const second = manuallyFeatured ?? sortedPosts[1];
  const topPosts = [newest, second].filter(Boolean);
  const restPosts = sortedPosts.filter((post) => !topPosts.includes(post));
  return { topPosts, restPosts };
};

// sort product by weight
export const sortByWeight = (array: any[]) => {
  const withWeight = array.filter(
    (item: { data: { weight: any } }) => item.data.weight
  );
  const withoutWeight = array.filter(
    (item: { data: { weight: any } }) => !item.data.weight
  );
  const sortedWeightedArray = withWeight.sort(
    (a: { data: { weight: number } }, b: { data: { weight: number } }) =>
      a.data.weight - b.data.weight
  );
  const sortedArray = [...new Set([...sortedWeightedArray, ...withoutWeight])];
  return sortedArray;
};
