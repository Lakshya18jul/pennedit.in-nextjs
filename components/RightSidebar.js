import React, { useState, useEffect } from "react";
// import "./RightSidebar.css";
import { SingleCategory } from "./index.js";
import { auth, db, storage } from "../firebase.js";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { collection, query, where, getDocs } from "firebase/firestore";

function RightSidebar(props) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currUserState, setCurrUserState] = useRecoilState(userState);

  useEffect(async () => {
    const q = query(
      collection(db, "users"),
      where("uid", "==", currUserState.uid)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((user) => {
      let final_categories = [];
      user.data().categories_chosen.map((categoryName) => {
        final_categories.push(categoryName);
        setCategories([...final_categories]);
      });
      setLoading(false);
    });
  }, []);

  return (
    <React.Fragment>
      {!loading && (
        <div className="rightSidebar">
          <div className="categories">
            <div className="categories-header">
              <span>Categories</span>
            </div>

            <div className="all-categories">
              {categories.length !== 0 &&
                categories.map((categoryName) => {
                  return (
                    <SingleCategory
                      categoryName={categoryName}
                      key={categoryName}
                    />
                  );
                })}

              {categories.length === 0 && (
                <div className="no-categories">
                  <i className="fas fa-list"></i>
                  <span>No categories chosen</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default RightSidebar;
