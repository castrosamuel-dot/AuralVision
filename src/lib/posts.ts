import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "./firebase";
import { Post } from "@/types";

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef, 
      where("published", "==", true), 
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Post;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
    try {
      // Mapping slug-like category to Display Category if needed, but for now assuming simple mapping or loose match
      // Ideally we store normalized categories or map them.
      // Let's Capitalize the first letter for simple matching if URL is 'event-av' -> 'Event av'??
      // Better: In the db we stored 'Event AV', 'Technology', etc.
      
      let dbCategory = category;
      if (category === 'event-av') dbCategory = 'Event AV';
      if (category === 'technology') dbCategory = 'Technology';
      if (category === 'reviews') dbCategory = 'Reviews';
      if (category === 'how-to') dbCategory = 'How-to';

      const postsRef = collection(db, "posts");
      const q = query(
        postsRef, 
        where("published", "==", true), 
        where("category", "==", dbCategory),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error("Error fetching posts by category:", error);
      return [];
    }
  }
