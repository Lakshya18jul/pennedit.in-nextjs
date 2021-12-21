import React, { useState, useEffect } from "react";
// import "./Feed.css";
import Post from "./Post.js";
import { db, storage, auth } from "../firebase.js";
import { signOut } from "firebase/auth";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  getDoc,
  doc,
  orderBy,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";

function Feed(props) {
  const [posts, setPosts] = useState([]);
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [curr_userId, setCurr_userId] = useState("");
  const [profileImageLink, setProfileImageLink] = useState("");
  const [coverImageLink, setCoverImageLink] = useState("");

  const { firstName, lastName, short_description, following, followers } =
    currUserState;

  useEffect(async () => {
    if (currUserState !== null) {
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));

      const querySnapshot = await getDocs(q);
      let final_posts = [];

      querySnapshot.forEach((postData) => {
        final_posts.push(postData.id);
        setPosts([...final_posts]);
      });

      let currUserId;
      const usersRef = collection(db, "users");
      const q2 = query(usersRef, where("uid", "==", currUserState.uid));
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach((user) => {
        setCurr_userId(user.id);
        currUserId = user.id;
      });

      if (JSON.stringify(currUserState.coverPic) === "{}") {
        setCoverImageLink(null);
      } else {
        const imageRef = ref(
          storage,
          `images/${currUserId}/${currUserState.coverPic.name}`
        );
        getDownloadURL(imageRef)
          .then((url) => {
            setCoverImageLink(url);
          })
          .catch((error) => {
            alert("Error in downloading the url");
          });
      }

      if (JSON.stringify(currUserState.profilePic) === "{}") {
        setProfileImageLink(null);
        setLoading(false);
      } else {
        const imageRef = ref(
          storage,
          `images/${currUserId}/${currUserState.profilePic.name}`
        );
        getDownloadURL(imageRef)
          .then((url) => {
            setProfileImageLink(url);
            setLoading(false);
          })
          .catch((error) => {
            alert("Error in downloading the url");
          });
      }
    }
  }, [currUserState]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setCurrUserState(null);
        router.push("/");
      })
      .catch((error) => {
        alert("Error found on logging out");
      });
  };

  const handleProfileNav = () => {
    router.push(`/profile/${curr_userId}`);
  };

  return (
    <React.Fragment>
      {!loading && (
        <div className="feed">
          <div className="feed-user-profile">
            <div className="feed-user-profile-top">
              <img
                src={
                  coverImageLink
                    ? coverImageLink
                    : "https://images.ctfassets.net/7thvzrs93dvf/wpImage18643/2f45c72db7876d2f40623a8b09a88b17/linkedin-default-background-cover-photo-1.png?w=790&h=196&q=90&fm=png"
                }
                alt="feed-user-profile-cover-image"
                className="feed-user-profile-cover-image"
              />

              <img
                src={
                  profileImageLink
                    ? profileImageLink
                    : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
                }
                alt="feed-user-profile-profile-image"
                className="feed-user-profile-profile-image"
              />
            </div>

            <div className="feed-user-profile-body">
              <div className="feed-user-profile-info">
                <span className="feed-user-profile-username">
                  {firstName} {lastName}
                </span>
                <span className="feed-user-profile-description">
                  {short_description}
                </span>

                <div className="feed-user-profile-buttons">
                  <div
                    className="feed-user-profile-button"
                    onClick={handleProfileNav}
                  >
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </div>

                  <div
                    className="feed-user-profile-button"
                    onClick={handleLogout}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </div>
                </div>
              </div>

              <div className="feed-user-profile-counts">
                <div className="feed-user-profile-count">
                  <span className="feed-user-count-num">
                    {following.length}
                  </span>
                  <span className="feed-user-count-type">Following</span>
                </div>

                <div className="feed-user-profile-count">
                  <span className="feed-user-count-num">
                    {followers.length}
                  </span>
                  <span className="feed-user-count-type">Followers</span>
                </div>
              </div>
            </div>
          </div>
          <div className="feed-inputContainer">
            <div
              className="feed-addPost"
              onClick={() => props.openCreatePostModal(true)}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fpost%20icon.png?alt=media&token=1afc5ff8-a6c9-42eb-bb6f-6f19a46dfee0"
                alt="add-post"
                className="feed-addPost-image"
              />
              <span>Add Post</span>
            </div>
            <div
              className="feed-addQuestion"
              onClick={() => props.openAskQuestionModal(true)}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fquestion%20icon.png?alt=media&token=3c88de20-bddd-4f3b-a72d-8a4f979fc45b"
                alt="add-question"
                className="feed-addQuestion-image"
              />
              <span>Ask Question</span>
            </div>
          </div>
          {posts.map((post) => {
            return <Post postId={post} key={post} />;
          })}
        </div>
      )}
    </React.Fragment>
  );
}

export default Feed;
