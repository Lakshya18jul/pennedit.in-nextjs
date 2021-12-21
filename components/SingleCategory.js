import React, { useState, useEffect } from "react";
// import './SingleCategory.css';
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
} from "firebase/firestore";
import { db, storage } from "../firebase.js";

function SingleCategory(props) {
  const { categoryName } = props;
  const [categoryPosts, setCategoryPosts] = useState(0);
  const [categoryQuestions, setCategoryQuestions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    const categoryRef = doc(db, "categories", categoryName);
    const categorySnap = await getDoc(categoryRef);
    setCategoryPosts(categorySnap.data().postIds.length);
    setCategoryQuestions(categorySnap.data().questionIds.length);
    setLoading(false);
  }, []);

  return (
    <React.Fragment>
      {!loading && (
        <div className="single-category">
          <div className="category-name">
            <i className="fas fa-list"></i>
            <span>{categoryName}</span>
          </div>

          <div className="category-data">
            <div className="category-posts">
              <span>{categoryPosts}</span>
            </div>

            <div className="category-questions">
              <span>{categoryQuestions}</span>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default SingleCategory;
