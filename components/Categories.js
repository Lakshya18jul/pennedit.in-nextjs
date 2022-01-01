import React, { useEffect, useState } from "react";
// import "./Categories.css";
import { Header, HomeLeftSidebar, SingleCategory } from "./index.js";
import Post from "./Post";
import Question from "./Question";
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import Head from "next/head";

function Categories(props) {
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState(true);
  const [allCategories, setAllCategories] = useState(false);

  const [allCategoriesArray, setAllCategoriesArray] = useState([]);
  const [favouritesCategoriesArray, setFavouriteCategoriesArray] = useState([]);

  const [categoryPosts, setCategoryPosts] = useState(true);
  const [categoryQuestions, setCategoryQuestions] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryPosts, setSelectedCategoryPosts] = useState([]);
  const [selectedCategoryQuestions, setSelectedCategoryQuestions] = useState(
    []
  );

  const [isCategoriesListOpen, setCategoryList] = useState(true);

  useEffect(async () => {
    if (selectedCategory !== "") {
      const categoryRef = doc(db, "categories", selectedCategory);
      const categorySnap = await getDoc(categoryRef);
      setSelectedCategoryPosts([...categorySnap.data().postIds]);
      setSelectedCategoryQuestions([...categorySnap.data().questionIds]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    window.scrollTo(0, 0);
    onAuthStateChanged(auth, async (user) => {
      if (!user || !auth.currentUser.emailVerified) {
        router.push("/");
      } else if (user && !currUserState && auth.currentUser.emailVerified) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setCurrUserState(doc.data());
        });
      }
    });
  }, []);

  const [windowWidth, setWindowWidth] = useState(1000);

  useEffect(() => {
    function updateSize() {
      setWindowWidth(window.innerWidth);
    }
    setWindowWidth(window.innerWidth);
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(async () => {
    if (currUserState) {
      const q = query(
        collection(db, "users"),
        where("uid", "==", currUserState.uid)
      );
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((user) => {
        setFavouriteCategoriesArray([...user.data().categories_chosen]);
      });

      let final_categories = [];
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      categoriesSnapshot.forEach((category) => {
        final_categories.push(category.id);
        setAllCategoriesArray([...final_categories]);
      });

      setLoading(false);
    }
  }, [currUserState]);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    setCategoryList(false);
  };

  return (
    <div className="categories-page">
      {!loading && (
        <React.Fragment>
          <Head>
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
            <title>Pennedit.in – Categories</title>
            <link
              rel="stylesheet"
              href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
              integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm"
              crossOrigin="anonymous"
            />
            <link
              href="https://fonts.googleapis.com/css?family=Nunito"
              rel="stylesheet"
            />
            <link
              href="https://fonts.googleapis.com/css?family=Pacifico"
              rel="stylesheet"
            />

            <link
              rel="stylesheet"
              href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
              integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm"
              crossOrigin="anonymous"
            />
            <link
              rel="icon"
              href="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fdownload.png?alt=media&token=30917a0f-c98c-4a77-971b-3dcb02efcb54"
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1 , minimum-scale=1"
            />
          </Head>

          <Header />
          <div className="categories-page-content">
            <div className="categories-section">
              <div className="home-leftSidebar-categories">
                <HomeLeftSidebar />
              </div>

              {windowWidth > 800 && (
                <div className="categories-box">
                  <div className="categories-leftbar">
                    <div className="categories-leftbar-header">
                      <span>Categories</span>
                      <div className="categories-leftbar-header-nav">
                        <span
                          className={
                            favourites && "categories-leftbar-header-nav-chosen"
                          }
                          onClick={() => {
                            setFavourites(true);
                            setAllCategories(false);
                          }}
                        >
                          Favourites
                        </span>
                        <span
                          className={
                            allCategories &&
                            "categories-leftbar-header-nav-chosen"
                          }
                          onClick={() => {
                            setAllCategories(true);
                            setFavourites(false);
                          }}
                        >
                          All Categories
                        </span>
                      </div>
                    </div>

                    <div className="categories-leftbar-list">
                      {favourites &&
                        favouritesCategoriesArray.length !== 0 &&
                        favouritesCategoriesArray.map((categoryName) => {
                          return (
                            <div
                              onClick={() => handleCategoryClick(categoryName)}
                              key={categoryName}
                            >
                              <SingleCategory
                                categoryName={categoryName}
                                key={categoryName}
                              />
                            </div>
                          );
                        })}

                      {favourites && favouritesCategoriesArray.length === 0 && (
                        <div className="no-categories">
                          <i className="fas fa-list"></i>
                          <span>No categories chosen</span>
                        </div>
                      )}

                      {allCategories &&
                        allCategoriesArray.map((categoryName) => {
                          return (
                            <div
                              onClick={() => handleCategoryClick(categoryName)}
                              key={categoryName}
                            >
                              <SingleCategory
                                categoryName={categoryName}
                                key={categoryName}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {selectedCategory === "" ? (
                    <div className="no-category-selected">
                      <span>Select a category to view</span>
                    </div>
                  ) : (
                    <div className="categories-rightbar">
                      <div className="categories-rightbar-header">
                        <div className="rightbar-header-left">
                          <img
                            src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flist%20icon%20grey.png?alt=media&token=16212956-78c3-45f6-89f6-8ca4f9a72dc6"
                            alt="category-icon-header"
                          />
                          <span>{selectedCategory}</span>
                        </div>

                        <div className="rightbar-header-right">
                          <div className="rightbar-header-posts">
                            <span
                              className={
                                categoryPosts &&
                                "categories-leftbar-header-nav-chosen"
                              }
                              onClick={() => {
                                setCategoryPosts(true);
                                setCategoryQuestions(false);
                              }}
                            >
                              Posts
                            </span>
                            <div className="rightbar-header-posts-count">
                              <span>{selectedCategoryPosts.length}</span>
                            </div>
                          </div>

                          <div className="rightbar-header-questions">
                            <span
                              className={
                                categoryQuestions &&
                                "categories-leftbar-header-nav-chosen"
                              }
                              onClick={() => {
                                setCategoryQuestions(true);
                                setCategoryPosts(false);
                              }}
                            >
                              Questions
                            </span>
                            <div className="rightbar-header-questions-count">
                              <span>{selectedCategoryQuestions.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="categories-rightbar-body">
                        <div className="categories-rightbar-list">
                          {categoryPosts &&
                            selectedCategoryPosts.map((postId) => {
                              return <Post postId={postId} key={postId} />;
                            })}
                          {categoryQuestions &&
                            selectedCategoryQuestions.map((questionId) => {
                              return (
                                <Question
                                  questionId={questionId}
                                  key={questionId}
                                />
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {windowWidth <= 800 && (
                <div className="categories-box">
                  {isCategoriesListOpen ? (
                    <div className="categories-leftbar">
                      <div className="categories-leftbar-header">
                        <span>Categories</span>
                        <div className="categories-leftbar-header-nav">
                          <span
                            className={
                              favourites &&
                              "categories-leftbar-header-nav-chosen"
                            }
                            onClick={() => {
                              setFavourites(true);
                              setAllCategories(false);
                            }}
                          >
                            Favourites
                          </span>
                          <span
                            className={
                              allCategories &&
                              "categories-leftbar-header-nav-chosen"
                            }
                            onClick={() => {
                              setAllCategories(true);
                              setFavourites(false);
                            }}
                          >
                            All Categories
                          </span>
                        </div>
                      </div>

                      <div className="categories-leftbar-list">
                        {favourites &&
                          favouritesCategoriesArray.map((categoryName) => {
                            return (
                              <div
                                onClick={() =>
                                  handleCategoryClick(categoryName)
                                }
                                key={categoryName}
                              >
                                <SingleCategory
                                  categoryName={categoryName}
                                  key={categoryName}
                                />
                              </div>
                            );
                          })}
                        {allCategories &&
                          allCategoriesArray.map((categoryName) => {
                            return (
                              <div
                                onClick={() =>
                                  handleCategoryClick(categoryName)
                                }
                                key={categoryName}
                              >
                                <SingleCategory
                                  categoryName={categoryName}
                                  key={categoryName}
                                />
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ) : (
                    <div className="categories-rightbar">
                      <div className="categories-rightbar-header">
                        <div className="rightbar-header-left">
                          <img
                            src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Farrow%20left.png?alt=media&token=4ef18410-6a2a-4900-808b-acdc21aa0e20"
                            alt="arrow-left-icon"
                            onClick={() => setCategoryList(true)}
                          />

                          <span>{selectedCategory}</span>
                        </div>

                        <div className="rightbar-header-right">
                          <div className="rightbar-header-posts">
                            <span
                              className={
                                categoryPosts &&
                                "categories-leftbar-header-nav-chosen"
                              }
                              onClick={() => {
                                setCategoryPosts(true);
                                setCategoryQuestions(false);
                              }}
                            >
                              Posts
                            </span>
                            <div className="rightbar-header-posts-count">
                              <span>{selectedCategoryPosts.length}</span>
                            </div>
                          </div>

                          <div className="rightbar-header-questions">
                            <span
                              className={
                                categoryQuestions &&
                                "categories-leftbar-header-nav-chosen"
                              }
                              onClick={() => {
                                setCategoryQuestions(true);
                                setCategoryPosts(false);
                              }}
                            >
                              Questions
                            </span>
                            <div className="rightbar-header-questions-count">
                              <span>{selectedCategoryQuestions.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="categories-rightbar-body">
                        <div className="categories-rightbar-list">
                          {categoryPosts &&
                            selectedCategoryPosts.map((postId) => {
                              return <Post postId={postId} key={postId} />;
                            })}
                          {categoryQuestions &&
                            selectedCategoryQuestions.map((questionId) => {
                              return (
                                <Question
                                  questionId={questionId}
                                  key={questionId}
                                />
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default Categories;
