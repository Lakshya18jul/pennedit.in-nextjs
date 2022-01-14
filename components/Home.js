import React, { useEffect, useState } from "react";
// import "./Home.css";
import { HomeLeftSidebar, Feed, RightSidebar, Header } from "./index";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import LoadingName from "./LoadingName.js";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import Head from "next/head";

import dynamic from "next/dynamic";
import { EditorState } from "draft-js";
import { convertFromRaw, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((module) => module.Editor),
  {
    ssr: false,
  }
);

function Home(props) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [postCategory, setPostCategory] = useState("");
  const [questionCategory, setQuestionCategory] = useState("");
  const [currUserState, setCurrUserState] = useRecoilState(userState);

  useEffect(async () => {
    if (currUserState) {
      window.scrollTo(0, 0);
      const postsSnapshot = await getDocs(collection(db, "posts"));
      let postsArray = [];
      postsSnapshot.forEach((post) => {
        postsArray.push(post.id);
      });
      let final_categories = [];
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      categoriesSnapshot.forEach((category) => {
        final_categories.push(category.id);
        setCategories([...final_categories]);
      });

      setLoading(false);
    }
  }, [currUserState]);

  const [isCreatePostModalOpen, setCreatePostModal] = useState(false);
  const [isAskQuestionModalOpen, setAskQuestionModal] = useState(false);

  const [postText, setPostText] = useState("");
  const [questionText, setQuestionText] = useState("");

  const [editorPostState, setEditorPostState] = useState(
    EditorState.createEmpty()
  );

  const onEditorPostStateChange = (editorPostState) => {
    setEditorPostState(editorPostState);
    setPostText(draftToHtml(convertToRaw(editorPostState.getCurrentContent())));
  };

  const handlePublishPost = async () => {
    let curr_user_docid;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", currUserState.uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      curr_user_docid = doc.id;
    });

    const addNewPost = async () => {
      const new_post_object = {
        user_docid: curr_user_docid,
        timestamp: Timestamp.fromDate(new Date()),
        likes: [],
        dislikes: [],
        comments: [],
        post_content: postText,
        category: postCategory,
      };
      const new_post = await addDoc(collection(db, "posts"), new_post_object);

      const categoryRef = doc(db, "categories", postCategory);
      const categorySnap = await getDoc(categoryRef);

      const prev_postIds = categorySnap.data().postIds;

      await updateDoc(categoryRef, {
        postIds: [new_post.id, ...prev_postIds],
      });

      querySnapshot.forEach(async (user) => {
        const userRef = doc(db, "users", user.id);
        const prev_posts = user.data().posts_made;
        await updateDoc(userRef, {
          posts_made: [new_post.id, ...prev_posts],
        });
      });
    };

    addNewPost();
    setPostText("");
    setPostCategory("");
    setEditorPostState(EditorState.createEmpty());
    setCreatePostModal(false);
  };

  const handlePublishQuestion = async () => {
    let curr_user_docid;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", currUserState.uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      curr_user_docid = doc.id;
    });

    const addNewQuestion = async () => {
      const new_question = await addDoc(collection(db, "questions"), {
        user_docid: curr_user_docid,
        timestamp: Timestamp.fromDate(new Date()),
        question_content: questionText,
        category: questionCategory,
        answers: [],
      });

      const categoryRef = doc(db, "categories", questionCategory);
      const categorySnap = await getDoc(categoryRef);

      const prev_questionIds = categorySnap.data().questionIds;

      await updateDoc(categoryRef, {
        questionIds: [new_question.id, ...prev_questionIds],
      });

      querySnapshot.forEach(async (user) => {
        const userRef = doc(db, "users", user.id);
        const prev_questions = user.data().questions_asked;
        await updateDoc(userRef, {
          questions_asked: [new_question.id, ...prev_questions],
        });
      });
    };

    addNewQuestion();
    setQuestionText("");
    setQuestionCategory("");
    setAskQuestionModal(false);
  };

  const handlePostCategoryClick = (categoryName) => {
    setPostCategory(categoryName);
  };

  const handleQuestionCategoryClick = (categoryName) => {
    setQuestionCategory(categoryName);
  };

  return (
    <React.Fragment>
      {!loading && (
        <div className="home">
          <React.Fragment>
            <Head>
              <meta
                name="description"
                content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
              />
              <title>Pennedit.in – Home</title>
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
            <div className="home-section">
              <HomeLeftSidebar />
              <Feed
                openAskQuestionModal={setAskQuestionModal}
                openCreatePostModal={setCreatePostModal}
              />
              <RightSidebar />
            </div>

            <div
              className={isCreatePostModalOpen ? "show-modal" : "hide-modal"}
              onClick={() => setCreatePostModal(false)}
            >
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box-header">
                  <span className="modal-box-heading">Create Post</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setCreatePostModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="post-modal-box">
                    <Editor
                      editorState={editorPostState}
                      onEditorStateChange={onEditorPostStateChange}
                      toolbar={{
                        options: ["inline", "list"],
                        inline: {
                          options: ["bold", "italic", "underline"],
                        },
                      }}
                      className="editor-typing"
                    />
                  </div>

                  <div className="home-categories-section">
                    <div className="home-categories-body">
                      <div className="home-categories-header">
                        <span>Choose Category</span>
                      </div>

                      <div className="user-profile-categories">
                        {categories.map((category) => {
                          return (
                            <div
                              className="user-profile-single-category"
                              onClick={() => handlePostCategoryClick(category)}
                              key={category}
                            >
                              <span
                                className={
                                  postCategory === category
                                    ? "chosen-category"
                                    : "not-chosen-category"
                                }
                              >
                                {category}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="post-modal-box-buttons">
                    {postText.length <= 8 || postCategory === "" ? (
                      <button className="post-modal-box-disabled-submit">
                        Pen My Post
                      </button>
                    ) : (
                      <button
                        className="post-modal-box-submit"
                        onClick={handlePublishPost}
                      >
                        Pen Your Post
                      </button>
                    )}

                    <button
                      className="post-modal-box-cancel"
                      onClick={() => {
                        setPostText("");
                        setEditorPostState(EditorState.createEmpty());
                        setPostCategory("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={isAskQuestionModalOpen ? "show-modal" : "hide-modal"}
              onClick={() => setAskQuestionModal(false)}
            >
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box-header">
                  <span className="modal-box-heading">Ask Question</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setAskQuestionModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="post-modal-box">
                    <textarea
                      placeholder="Pen down your Question to the world....."
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="home-categories-section">
                    <div className="home-categories-body">
                      <div className="home-categories-header">
                        <span>Choose Category</span>
                      </div>

                      <div className="user-profile-categories">
                        {categories.map((category) => {
                          return (
                            <div
                              className="user-profile-single-category"
                              onClick={() =>
                                handleQuestionCategoryClick(category)
                              }
                              key={category}
                            >
                              <span
                                className={
                                  questionCategory === category
                                    ? "chosen-category"
                                    : "not-chosen-category"
                                }
                              >
                                {category}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="post-modal-box-buttons">
                    {questionText === "" || questionCategory === "" ? (
                      <button className="post-modal-box-disabled-submit">
                        Pen My Question
                      </button>
                    ) : (
                      <button
                        className="post-modal-box-submit"
                        onClick={handlePublishQuestion}
                      >
                        Pen My Question
                      </button>
                    )}

                    <button
                      className="post-modal-box-cancel"
                      onClick={() => {
                        setQuestionText("");
                        setQuestionCategory("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        </div>
      )}

      {loading && (
        <Head>
          <meta
            name="description"
            content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
          />
          <title>Pennedit</title>
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
      )}
    </React.Fragment>
  );
}

export default Home;
