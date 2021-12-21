import React, { useState, useEffect } from "react";
import { Header, RightSidebar, Post, Question, AnswerWithQues } from "./index";
import LoadingName from "./LoadingName";
// import "./Profile.css";
import { auth, db, storage } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
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
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { useRouter } from "next/router";
import Head from "next/head";

function Profile(props) {
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const router = useRouter();
  const user_profile_docid = props.profileId;

  const [loading, setLoading] = useState(true);
  const [dataToUse, setDataToUse] = useState({});
  const [is_curr_signed_user, setCurrSignedUser] = useState(false);
  const [coverImageLink, setCoverImageLink] = useState(null);
  const [profileImageLink, setProfileImageLink] = useState(null);

  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [updatedCategories, setUpdatedCategories] = useState([]);

  const [isFollowing, setIsFollowing] = useState(false);
  const [currUserId, setCurrUserId] = useState("");

  var {
    firstName,
    lastName,
    short_description,
    location,
    joined_on,
    email,
    profilePic,
    coverPic,
    uid,
    posts_made,
    questions_asked,
    categories_chosen,
    followers,
    following,
  } = dataToUse;

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

  useEffect(async () => {
    if (currUserState) {
      const q = query(
        collection(db, "users"),
        where("uid", "==", currUserState.uid)
      );
      const querySnapshot = await getDocs(q);

      const docRef = doc(db, "users", user_profile_docid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        router.push("/404");
        return;
      }

      let final_categories = [];
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      categoriesSnapshot.forEach((category) => {
        final_categories.push(category.id);
        setCategories([...final_categories]);
      });

      let curruserid = "";
      querySnapshot.forEach((user) => {
        curruserid = user.id;
        if (user.id === user_profile_docid) {
          setCurrSignedUser(true);
        }
      });

      setDataToUse(docSnap.data());
      setIsFollowing(docSnap.data().followers.includes(curruserid));
      setCurrUserId(curruserid);

      setUpdatedCategories([...docSnap.data().categories_chosen]);

      const q1 = query(
        collection(db, "posts"),
        where("user_docid", "==", user_profile_docid),
        orderBy("timestamp", "desc")
      );
      const querySnapshot1 = await getDocs(q1);

      let final_posts = [];
      querySnapshot1.forEach((postData) => {
        final_posts.push(postData.id);
        setPosts([...final_posts]);
      });

      const q2 = query(
        collection(db, "questions"),
        where("user_docid", "==", user_profile_docid),
        orderBy("timestamp", "desc")
      );

      let final_questions = [];

      const querySnapshot2 = await getDocs(q2);

      querySnapshot2.forEach((questionData) => {
        final_questions.push(questionData.id);
        setQuestions([...final_questions]);
      });

      const q3 = query(
        collection(db, "answers"),
        where("user_docid", "==", user_profile_docid),
        orderBy("timestamp", "desc")
      );

      const querySnapshot3 = await getDocs(q3);

      let final_answers = [];

      querySnapshot3.forEach((answerData) => {
        final_answers.push(answerData.id);
        setAnswers([...final_answers]);
      });

      if (JSON.stringify(docSnap.data().coverPic) === "{}") {
        setCoverImageLink(null);
      } else {
        const imageRef = ref(
          storage,
          `images/${user_profile_docid}/${docSnap.data().coverPic.name}`
        );
        getDownloadURL(imageRef)
          .then((url) => {
            setCoverImageLink(url);
          })
          .catch((error) => {
            alert("Error encountered in downloading the URL");
          });
      }

      if (JSON.stringify(docSnap.data().profilePic) === "{}") {
        setProfileImageLink(null);
      } else {
        const imageRef = ref(
          storage,
          `images/${user_profile_docid}/${docSnap.data().profilePic.name}`
        );
        getDownloadURL(imageRef)
          .then((url) => {
            setProfileImageLink(url);
          })
          .catch((error) => {
            alert("Error encountered in downloading the URL");
          });
      }

      setLoading(false);
    }
  }, [currUserState]);

  const [posts_active, setPostsActivity] = useState(true);
  const [questions_active, setQuestionsActivity] = useState(false);
  const [answers_active, setAnswersActivity] = useState(false);

  const handlePostsClick = () => {
    setPostsActivity(true);
    setQuestionsActivity(false);
    setAnswersActivity(false);
  };

  const handleAnswersClick = async () => {
    setPostsActivity(false);
    setQuestionsActivity(false);
    setAnswersActivity(true);

    const q3 = query(
      collection(db, "answers"),
      where("user_docid", "==", user_profile_docid),
      orderBy("timestamp", "desc")
    );

    const querySnapshot3 = await getDocs(q3);

    let final_answers = [];

    querySnapshot3.forEach((answerData) => {
      final_answers.push(answerData.id);
      setAnswers([...final_answers]);
    });
  };

  const handleQuestionsClick = () => {
    setPostsActivity(false);
    setQuestionsActivity(true);
    setAnswersActivity(false);
  };

  const [isEditCoverPhotoModalOpen, setEditCoverPhotoModal] = useState(false);
  const [isEditProfilePhotoModalOpen, setEditProfilePhotoModal] =
    useState(false);
  const [isEditUserInfoModalOpen, setEditUserInfoModal] = useState(false);
  const [isPostDeleteModalOpen, setPostDeleteModal] = useState(false);
  const [isQuestionDeleteModalOpen, setQuestionDeleteModal] = useState(false);
  const [isAnswerDeleteModalOpen, setAnswerDeleteModal] = useState(false);

  const [postToDelete, setPostToDelete] = useState("");
  const [questionToDelete, setQuestionToDelete] = useState("");
  const [answerToDelete, setAnswerToDelete] = useState("");

  const [coverImage, setCoverImage] = useState(coverPic);

  const [profileImage, setProfileImage] = useState(profilePic);

  const handleCoverImageChange = (e) => {
    if (e.target.files[0]) {
      setCoverImage(e.target.files[0]);
      setCoverImageLink(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setProfileImageLink(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleCoverImageUpload = () => {
    if (document.getElementById("cover-img-id").value === "") {
      return;
    } else {
      if (JSON.stringify(coverPic) !== "{}") {
        const desertRef = ref(
          storage,
          `images/${user_profile_docid}/${coverPic.name}`
        );

        deleteObject(desertRef)
          .then(() => {})
          .catch((error) => {
            alert("Error while deleting a file");
          });
      }

      const uploadImagesRef = ref(
        storage,
        `images/${user_profile_docid}/${coverImage.name}`
      );

      uploadBytes(uploadImagesRef, coverImage)
        .then(async (snapshot) => {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (user) => {
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
              coverPic: {
                name: coverImage.name,
                type: coverImage.type,
                size: coverImage.size,
              },
            });
          });
        })
        .catch((error) => {
          alert("Error in uploading the image");
        });
      document.getElementById("cover-img-id").value = "";
      setEditCoverPhotoModal(false);
    }
  };

  const handleCoverImageDelete = async () => {
    if (JSON.stringify(coverPic) !== "{}") {
      const desertRef = ref(
        storage,
        `images/${user_profile_docid}/${coverPic.name}`
      );

      deleteObject(desertRef)
        .then(() => {})
        .catch((error) => {
          alert("Error while deleting a file");
        });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (user) => {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        coverPic: {},
      });
      setCoverImageLink(null);
      setCoverImage({});
      document.getElementById("cover-img-id").value = "";
      setEditCoverPhotoModal(false);
    });
  };

  const handleProfileImageUpload = () => {
    if (document.getElementById("profile-img-id").value === "") {
      return;
    } else {
      if (JSON.stringify(profilePic) !== "{}") {
        const desertRef = ref(
          storage,
          `images/${user_profile_docid}/${profilePic.name}`
        );

        deleteObject(desertRef)
          .then(() => {})
          .catch((error) => {
            alert("Error while deleting a file");
          });
      }

      const uploadImagesRef = ref(
        storage,
        `images/${user_profile_docid}/${profileImage.name}`
      );

      uploadBytes(uploadImagesRef, profileImage)
        .then(async (snapshot) => {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (user) => {
            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
              profilePic: {
                name: profileImage.name,
                type: profileImage.type,
                size: profileImage.size,
              },
            });
          });
        })
        .catch((error) => {
          alert("Error in uploading the image");
        });
      document.getElementById("profile-img-id").value = "";
      setEditProfilePhotoModal(false);
    }
  };

  const handleProfileImageDelete = async () => {
    if (JSON.stringify(profilePic) !== "{}") {
      const desertRef = ref(
        storage,
        `images/${user_profile_docid}/${profilePic.name}`
      );

      deleteObject(desertRef)
        .then(() => {})
        .catch((error) => {
          alert("Error while deleting a file");
        });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (user) => {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        profilePic: {},
      });
      setProfileImageLink(null);
      setProfileImage({});
      document.getElementById("profile-img-id").value = "";
      setEditProfilePhotoModal(false);
    });
  };

  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const [userShort_description, setUserShort_description] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [getUserInfo, setGetUserInfo] = useState(true);

  if (currUserState && getUserInfo && !loading) {
    setUserFirstName(firstName);
    setUserLastName(lastName);
    setUserLocation(location);
    setUserShort_description(short_description);
    setUserEmail(email);
    setGetUserInfo(false);
  }

  const check_fields = () => {
    if (
      userFirstName === "" ||
      userLastName === "" ||
      userEmail === "" ||
      userLocation == "" ||
      userShort_description == ""
    ) {
      return false;
    }

    return true;
  };

  const cancelUserInfoChange = () => {
    setUserFirstName(firstName);
    setUserLastName(lastName);
    setUserLocation(location);
    setUserShort_description(short_description);
    setUserEmail(email);
  };

  const handleUserInfoChange = async () => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (user) => {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        firstName: userFirstName,
        lastName: userLastName,
        location: userLocation,
        short_description: userShort_description,
        email: userEmail,
      });

      setEditUserInfoModal(false);
    });
  };

  const handleCategoryClick = async (categoryClicked) => {
    const userRef = doc(db, "users", user_profile_docid);
    if (updatedCategories.includes(categoryClicked)) {
      const new_categories = updatedCategories.filter(
        (category) => category !== categoryClicked
      );

      setUpdatedCategories([...new_categories]);
      await updateDoc(userRef, {
        categories_chosen: [...new_categories],
      });
    } else {
      setUpdatedCategories([categoryClicked, ...updatedCategories]);
      await updateDoc(userRef, {
        categories_chosen: [categoryClicked, ...updatedCategories],
      });
    }
  };

  const handleFollowClick = async () => {
    setIsFollowing(true);
    const userRef = doc(db, "users", user_profile_docid);
    const userSnap = await getDoc(userRef);
    const prev_followers = userSnap.data().followers;
    await updateDoc(userRef, {
      followers: [currUserId, ...prev_followers],
    });

    const signedUserRef = doc(db, "users", currUserId);
    const signedUserSnap = await getDoc(signedUserRef);
    const prev_following = signedUserSnap.data().following;
    await updateDoc(signedUserRef, {
      following: [user_profile_docid, ...prev_following],
    });
  };

  const handleUnfollowClick = async () => {
    setIsFollowing(false);
    const userRef = doc(db, "users", user_profile_docid);
    const userSnap = await getDoc(userRef);
    const prev_followers = userSnap.data().followers;
    const new_followers = prev_followers.filter(
      (follower) => follower !== currUserId
    );
    await updateDoc(userRef, {
      followers: [...new_followers],
    });

    const signedUserRef = doc(db, "users", currUserId);
    const signedUserSnap = await getDoc(signedUserRef);
    const prev_following = signedUserSnap.data().following;
    const new_following = prev_following.filter(
      (following) => following !== user_profile_docid
    );
    await updateDoc(signedUserRef, {
      following: [...new_following],
    });
  };

  const handleDeletePost = async (postToDelete) => {
    const new_posts = posts.filter((post) => post !== postToDelete);
    setPosts(new_posts);
    setPostDeleteModal(false);

    const userRef = doc(db, "users", user_profile_docid);
    await updateDoc(userRef, {
      posts_made: [...new_posts],
    });

    const postRef = doc(db, "posts", postToDelete);
    const postSnap = await getDoc(postRef);

    const categoryRef = doc(db, "categories", postSnap.data().category);
    const categorySnap = await getDoc(categoryRef);

    const new_posts_category = categorySnap
      .data()
      .postIds.filter((postId) => postId !== postToDelete);

    await updateDoc(categoryRef, {
      postIds: [...new_posts_category],
    });

    await deleteDoc(doc(db, "posts", postToDelete));
  };

  const handleDeleteQuestion = async (questionToDelete) => {
    const new_questions = questions.filter(
      (question) => question !== questionToDelete
    );
    setQuestions(new_questions);
    setQuestionDeleteModal(false);

    const userRef = doc(db, "users", user_profile_docid);
    await updateDoc(userRef, {
      questions_asked: [...new_questions],
    });
    const questionRef = doc(db, "questions", questionToDelete);
    const questionSnap = await getDoc(questionRef);

    const categoryRef = doc(db, "categories", questionSnap.data().category);
    const categorySnap = await getDoc(categoryRef);

    const new_questions_category = categorySnap
      .data()
      .questionIds.filter((questionId) => questionId !== questionToDelete);

    await updateDoc(categoryRef, {
      questionIds: [...new_questions_category],
    });

    const q = query(
      collection(db, "answers"),
      where("question_id", "==", questionToDelete)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (answer) => {
      const value = answer.data().user_docid;
      const userAnsweredRef = doc(db, "users", value);
      const userAnsweredSnap = await getDoc(userAnsweredRef);

      const new_answers = userAnsweredSnap
        .data()
        .answers.filter(
          (userAnswer) => userAnswer.question_id !== questionToDelete
        );

      await updateDoc(userAnsweredRef, {
        answers: [...new_answers],
      });

      await deleteDoc(doc(db, "answers", answer.id));
    });

    const q2 = query(
      collection(db, "users", user_profile_docid, "notifications"),
      where("question_answered", "==", questionToDelete)
    );

    const querySnapshot2 = await getDocs(q2);
    querySnapshot2.forEach(async (notification) => {
      await deleteDoc(
        doc(db, "users", user_profile_docid, "notifications", notification.id)
      );
    });

    await deleteDoc(doc(db, "questions", questionToDelete));
  };

  const handleDeleteAnswer = async (answerToDelete) => {
    const new_answers = answers.filter((answer) => answer !== answerToDelete);
    setAnswers(new_answers);
    setAnswerDeleteModal(false);

    const signedUserRef = doc(db, "users", currUserId);
    const signedUserSnap = await getDoc(signedUserRef);

    const prev_signed_user_answers = [...signedUserSnap.data().answers];
    const new_signed_user_answers = prev_signed_user_answers.filter(
      (answer) => answer.answer_id !== answerToDelete
    );

    await updateDoc(signedUserRef, {
      answers: [...new_signed_user_answers],
    });

    const answerRef = doc(db, "answers", answerToDelete);
    const answerSnap = await getDoc(answerRef);

    const questionRef = doc(db, "questions", answerSnap.data().question_id);
    const questionSnap = await getDoc(questionRef);

    const prev_question_answers = [...questionSnap.data().answers];

    const new_question_answers = prev_question_answers.filter(
      (answer) => answer != answerToDelete
    );

    await updateDoc(questionRef, {
      answers: [...new_question_answers],
    });

    await deleteDoc(doc(db, "answers", answerToDelete));
  };

  return (
    <React.Fragment>
      <div className="profile">
        {!loading && (
          <React.Fragment>
            <Head>
              <meta
                name="description"
                content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
              />
              <title>
                Pennedit.in – {firstName} {lastName}
              </title>
              <link
                rel="stylesheet"
                href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
                integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm"
                crossorigin="anonymous"
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
                crossorigin="anonymous"
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
            <div className="profile-main-content">
              <Header />
              <div className="profile-page-body">
                <div className="profile-page-content">
                  <div className="user-profile">
                    <div className="user-info">
                      <div className="user-info-header">
                        {is_curr_signed_user ? (
                          <img
                            src={
                              coverImageLink
                                ? coverImageLink
                                : "https://images.ctfassets.net/7thvzrs93dvf/wpImage18643/2f45c72db7876d2f40623a8b09a88b17/linkedin-default-background-cover-photo-1.png?w=790&h=196&q=90&fm=png"
                            }
                            alt="profile-cover-photo"
                            className="profile-cover-photo"
                            onClick={() => setEditCoverPhotoModal(true)}
                          />
                        ) : (
                          <img
                            src={
                              coverImageLink
                                ? coverImageLink
                                : "https://images.ctfassets.net/7thvzrs93dvf/wpImage18643/2f45c72db7876d2f40623a8b09a88b17/linkedin-default-background-cover-photo-1.png?w=790&h=196&q=90&fm=png"
                            }
                            alt="profile-cover-photo"
                            className="profile-cover-photo"
                          />
                        )}

                        {is_curr_signed_user ? (
                          <img
                            src={
                              profileImageLink
                                ? profileImageLink
                                : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
                            }
                            alt="user-profile-photo"
                            className="user-profile-photo"
                            onClick={() => setEditProfilePhotoModal(true)}
                          />
                        ) : (
                          <img
                            src={
                              profileImageLink
                                ? profileImageLink
                                : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
                            }
                            alt="user-profile-photo"
                            className="user-profile-photo"
                          />
                        )}
                      </div>

                      <div className="user-info-body">
                        <div className="user-info-details">
                          <span className="user-profile-name">
                            {firstName} {lastName}
                          </span>
                          <span className="user-profile-description">
                            {short_description}
                          </span>

                          <span className="user-profile-location">
                            Location : {location}
                          </span>

                          <span className="user-profile-joinedon">
                            Joined on : {joined_on.toDate().toDateString()}
                          </span>

                          {is_curr_signed_user ? (
                            <button
                              className="user-profile-followBtn"
                              onClick={() => setEditUserInfoModal(true)}
                            >
                              Edit Profile
                            </button>
                          ) : (
                            <div>
                              {isFollowing ? (
                                <div className="unfollowBtn">
                                  <button onClick={handleUnfollowClick}>
                                    Unfollow
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="user-profile-followBtn"
                                  onClick={handleFollowClick}
                                >
                                  Follow
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="user-info-count">
                          <div className="single-info-count">
                            <span className="count-num">
                              {following.length}
                            </span>
                            <span className="count-category">Following</span>
                          </div>

                          <div className="single-info-count">
                            <span className="count-num">
                              {followers.length}
                            </span>
                            <span className="count-category">Followers</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="user-contactInfo">
                      <div className="user-contactInfo-body">
                        <div className="user-contactInfo-header">
                          <span>Contact Info</span>
                        </div>

                        <div className="user-single-contactInfo">
                          <div className="contact-icon">
                            <i class="fas fa-envelope"></i>
                          </div>

                          <div className="contact-detail">
                            <span className="contact-detail-Field">Email</span>
                            <span className="contact-detail-value">
                              {email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="user-categories-section">
                      <div className="user-categories-body">
                        <div className="user-categories-header">
                          <span>Chosen Categories</span>
                        </div>

                        <div className="user-profile-categories">
                          {categories.map((category) => {
                            if (is_curr_signed_user) {
                              return (
                                <div
                                  className="user-profile-single-category"
                                  onClick={() => handleCategoryClick(category)}
                                >
                                  <span
                                    className={
                                      updatedCategories.includes(category)
                                        ? "chosen-category"
                                        : "not-chosen-category"
                                    }
                                  >
                                    {category}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="user-profile-single-category">
                                  <span
                                    className={
                                      updatedCategories.includes(category)
                                        ? "chosen-category"
                                        : "not-chosen-category"
                                    }
                                  >
                                    {category}
                                  </span>
                                </div>
                              );
                            }
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="user-profile-activity">
                      <div className="activity-headers">
                        <span
                          className={
                            posts_active
                              ? "selected-activity"
                              : "unselected-activity"
                          }
                          onClick={handlePostsClick}
                        >
                          Posts
                          <span className="user-activity-length">
                            {posts.length}{" "}
                          </span>
                        </span>
                        <span
                          className={
                            questions_active
                              ? "selected-activity"
                              : "unselected-activity"
                          }
                          onClick={handleQuestionsClick}
                        >
                          Questions
                          <span className="user-activity-length">
                            {questions.length}{" "}
                          </span>
                        </span>
                        <span
                          className={
                            answers_active
                              ? "selected-activity"
                              : "unselected-activity"
                          }
                          onClick={handleAnswersClick}
                        >
                          Answers
                          <span className="user-activity-length">
                            {answers.length}{" "}
                          </span>
                        </span>
                      </div>

                      <div>
                        {posts_active && (
                          <div>
                            {posts.length !== 0 &&
                              posts.map((post) => {
                                return (
                                  <Post
                                    postId={post}
                                    key={post}
                                    isSigned={is_curr_signed_user}
                                    controlPostDeleteModal={setPostDeleteModal}
                                    getPostToDelete={setPostToDelete}
                                  />
                                );
                              })}

                            {posts.length === 0 && (
                              <div className="no-posts-present">
                                <img
                                  src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2FEmpty%20box.png?alt=media&token=0373a2e4-4c2e-430b-b227-1ef902a7f218"
                                  alt="no-posts"
                                />
                                <span>No posts found</span>
                              </div>
                            )}
                          </div>
                        )}
                        {questions_active && (
                          <div>
                            {questions.length !== 0 &&
                              questions.map((question) => {
                                return (
                                  <Question
                                    questionId={question}
                                    key={question}
                                    isSigned={is_curr_signed_user}
                                    controlQuestionDeleteModal={
                                      setQuestionDeleteModal
                                    }
                                    getQuestionToDelete={setQuestionToDelete}
                                  />
                                );
                              })}

                            {questions.length === 0 && (
                              <div className="no-posts-present">
                                <img
                                  src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2FEmpty%20box.png?alt=media&token=0373a2e4-4c2e-430b-b227-1ef902a7f218"
                                  alt="no-posts"
                                />
                                <span>No questions found</span>
                              </div>
                            )}
                          </div>
                        )}
                        {answers_active && (
                          <div>
                            {answers.length !== 0 &&
                              answers.map((answer) => {
                                return (
                                  <AnswerWithQues
                                    answerId={answer}
                                    key={answer}
                                    isSigned={is_curr_signed_user}
                                    controlAnswerModal={setAnswerDeleteModal}
                                    getAnswerToDelete={setAnswerToDelete}
                                  />
                                );
                              })}

                            {answers.length === 0 && (
                              <div className="no-posts-present">
                                <img
                                  src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2FEmpty%20box.png?alt=media&token=0373a2e4-4c2e-430b-b227-1ef902a7f218"
                                  alt="no-posts"
                                />
                                <span>No answers found</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <RightSidebar />
                </div>
              </div>
            </div>

            <div
              className={
                isEditCoverPhotoModalOpen ? "show-modal" : "hide-modal"
              }
              onClick={() => setEditCoverPhotoModal(false)}
            >
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box-header">
                  <span className="modal-box-heading">Edit Cover Photo</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setEditCoverPhotoModal(false)}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="modal-box-coverPhoto">
                    <div className="modal-box-coverPhoto-chooseImage">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        id="cover-img-id"
                      />
                    </div>

                    <div className="modal-box-coverPhotoPreview">
                      {coverImageLink ? (
                        <img src={coverImageLink} alt="Cover Image" />
                      ) : (
                        <span>No Image Available</span>
                      )}
                    </div>

                    <div className="modal-box-coverPhotoButton">
                      <button
                        className="modal-box-coverPhoto-upload"
                        onClick={handleCoverImageUpload}
                      >
                        Upload Image
                      </button>

                      <button
                        className="modal-box-coverPhoto-delete"
                        onClick={handleCoverImageDelete}
                      >
                        Delete Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                isEditProfilePhotoModalOpen ? "show-modal" : "hide-modal"
              }
              onClick={() => setEditProfilePhotoModal(false)}
            >
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box-header">
                  <span className="modal-box-heading">Edit Profile Photo</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setEditProfilePhotoModal(false)}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="modal-box-coverPhoto">
                    <div className="modal-box-coverPhoto-chooseImage">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        id="profile-img-id"
                      />
                    </div>

                    <div className="modal-box-profilePhotoPreview">
                      {profileImageLink ? (
                        <img src={profileImageLink} alt="Profile Image" />
                      ) : (
                        <span>No Image Available</span>
                      )}
                    </div>

                    <div className="modal-box-profilePhotoButton">
                      <button
                        className="modal-box-profilePhoto-upload"
                        onClick={handleProfileImageUpload}
                      >
                        Upload Image
                      </button>

                      <button
                        className="modal-box-profilePhoto-delete"
                        onClick={handleProfileImageDelete}
                      >
                        Delete Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={isEditUserInfoModalOpen ? "show-modal" : "hide-modal"}
              onClick={() => setEditUserInfoModal(false)}
            >
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-box-header">
                  <span className="modal-box-heading">Edit User Info</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setEditUserInfoModal(false)}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="modal-box-userInfo">
                    <div className="modal-box-userInfo-fields">
                      <div className="modal-box-userInfo-field">
                        <span>First Name*</span>
                        <input
                          type="text"
                          value={userFirstName}
                          onChange={(e) => setUserFirstName(e.target.value)}
                        />
                      </div>

                      <div className="modal-box-userInfo-field">
                        <span>Last Name*</span>
                        <input
                          type="text"
                          value={userLastName}
                          onChange={(e) => setUserLastName(e.target.value)}
                        />
                      </div>

                      <div className="modal-box-userInfo-field">
                        <span>Short Description*</span>
                        <textarea
                          rows="5"
                          value={userShort_description}
                          onChange={(e) =>
                            setUserShort_description(e.target.value)
                          }
                        ></textarea>
                      </div>

                      <div className="modal-box-userInfo-field">
                        <span>Location*</span>
                        <input
                          type="text"
                          value={userLocation}
                          onChange={(e) => setUserLocation(e.target.value)}
                        />
                      </div>

                      <div className="modal-box-userInfo-field">
                        <span>Contact Info*</span>
                        <input
                          type="text"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-box-buttons">
                    {check_fields() && (
                      <button
                        className="modal-box-submitButton"
                        onClick={handleUserInfoChange}
                      >
                        Submit
                      </button>
                    )}

                    {!check_fields() && (
                      <button className=" disabled-modal-box-submitButton">
                        Submit
                      </button>
                    )}

                    <button
                      className="modal-box-cancelButton"
                      onClick={cancelUserInfoChange}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={isPostDeleteModalOpen ? "show-modal" : "hide-modal"}
              onClick={() => setPostDeleteModal(false)}
            >
              <div
                className="deletion-modal-box"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-box-header">
                  <span className="modal-box-heading">Post Deletion</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setPostDeleteModal(false)}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="post-delete-conformation-message">
                    <span>Are you sure you want to delete this Post ?</span>
                  </div>

                  <div className="post-delete-buttons">
                    <button
                      className="post-deletion-confirmed"
                      onClick={() => handleDeletePost(postToDelete)}
                    >
                      Delete Post
                    </button>

                    <button
                      onClick={() => setPostDeleteModal(false)}
                      className="cancel-post-deletion"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                isQuestionDeleteModalOpen ? "show-modal" : "hide-modal"
              }
              onClick={() => setQuestionDeleteModal(false)}
            >
              <div
                className="deletion-modal-box"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-box-header">
                  <span className="modal-box-heading">Question Deletion</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setQuestionDeleteModal(false)}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="post-delete-conformation-message">
                    <span>Are you sure you want to delete this Question ?</span>
                  </div>

                  <div className="post-delete-buttons">
                    <button
                      className="post-deletion-confirmed"
                      onClick={() => handleDeleteQuestion(questionToDelete)}
                    >
                      Delete Question
                    </button>

                    <button
                      onClick={() => setQuestionDeleteModal(false)}
                      className="cancel-post-deletion"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={isAnswerDeleteModalOpen ? "show-modal" : "hide-modal"}
              onClick={() => setAnswerDeleteModal(false)}
            >
              <div
                className="deletion-modal-box"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-box-header">
                  <span className="modal-box-heading">Answer Deletion</span>

                  <button
                    className="modal-box-close"
                    onClick={() => setAnswerDeleteModal(false)}
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div className="modal-box-body">
                  <div className="post-delete-conformation-message">
                    <span>Are you sure you want to delete this Answer ?</span>
                  </div>

                  <div className="post-delete-buttons">
                    <button
                      className="post-deletion-confirmed"
                      onClick={() => handleDeleteAnswer(answerToDelete)}
                    >
                      Delete Question
                    </button>

                    <button
                      onClick={() => setAnswerDeleteModal(false)}
                      className="cancel-post-deletion"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      {loading && (
        <div className="show-loader">
          <Head>
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
            <title>Pennedit.in – Profile</title>
            <link
              rel="stylesheet"
              href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
              integrity="sha384-DyZ88mC6Up2uqS4h/KRgHuoeGwBcD4Ng9SiP4dIRy0EXTlnuz47vAwmeGwVChigm"
              crossorigin="anonymous"
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
              crossorigin="anonymous"
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
          <LoadingName />{" "}
        </div>
      )}
    </React.Fragment>
  );
}

export default Profile;
