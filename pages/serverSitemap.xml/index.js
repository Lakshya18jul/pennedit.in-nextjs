import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  onSnapshot,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { getServerSideSitemap } from "next-sitemap";

export async function getServerSideProps(ctx) {
  const fields = [];
  const querySnapshot = await getDocs(collection(db, "questions"));
  querySnapshot.forEach((question) => {
    fields.push({
      loc: `https://pennedit.in/question/${question.id}`,
      lastmod: new Date().toISOString(),
    });
  });
  return getServerSideSitemap(ctx, fields);
}

export default function Site() {}
