import React, { useState, useEffect } from "react";
// import "./Post.css";
import Link from "next/link";
import { db, storage } from "../firebase.js";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import Comment from "./Comment.js";
import Linkify from "react-linkify";
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
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

function Post(props) {
  const [dataToUse, setDataToUse] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const [currUserPicLink, setCurrUserPicLink] = useState(null);

  const { postId } = props;
  const [currUserId, setCurrUserId] = useState("");
  const [likesArray, setLikesArray] = useState([]);
  const [dislikesArray, setDislikesArray] = useState([]);

  const [isReadMore, setReadMore] = useState(false);
  const [isReadLess, setReadLess] = useState(true);

  const {
    firstName,
    lastName,
    short_description,
    timestamp,
    post_content,
    user_docid,
    likes,
    dislikes,
    category,
  } = dataToUse;

  const [loading, setLoading] = useState(true);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  function addUserData(user_docid, data) {
    return new Promise((resolve, reject) => {
      const unsub = onSnapshot(doc(db, "users", user_docid), (user) => {
        data["firstName"] = user.data().firstName;
        data["lastName"] = user.data().lastName;
        data["short_description"] = user.data().short_description;
        data["profilePic"] = user.data().profilePic;
        resolve(data);
      });
    });
  }

  useEffect(async () => {
    let profilePic = {};

    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const data = postSnap.data();
      setLikesArray([...data.likes]);
      setDislikesArray([...data.dislikes]);
      const user_docid = postSnap.data().user_docid;
      const new_data = await addUserData(user_docid, data);
      setDataToUse(new_data);
      profilePic = new_data.profilePic;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", currUserState.uid));

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((user) => {
        setCurrUserId(user.id);
        if (JSON.stringify(user.data().profilePic) !== "{}") {
          const imageRef = ref(
            storage,
            `images/${user.id}/${user.data().profilePic.name}`
          );
          getDownloadURL(imageRef)
            .then((url) => {
              setCurrUserPicLink(url);
            })
            .catch((error) => {
              alert("Error in downloading the url");
            });
        }
      });

      const q2 = query(
        collection(db, "posts", postId, "comments"),
        orderBy("timestamp", "desc")
      );

      let final_comments = [];

      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach((comment) => {
        final_comments.push(comment.id);
      });
      setComments([...final_comments]);

      if (JSON.stringify(profilePic) === "{}") {
        setProfilePicUrl(null);
        setLoading(false);
      } else {
        const imageRef = ref(
          storage,
          `images/${user_docid}/${profilePic.name}`
        );
        getDownloadURL(imageRef)
          .then((url) => {
            setProfilePicUrl(url);
            setLoading(false);
          })
          .catch((error) => {
            alert("Error in downloading the url");
          });
      }
    }
  }, []);

  function checkLiked() {
    return likesArray.includes(currUserId);
  }

  function checkdisLiked() {
    return dislikesArray.includes(currUserId);
  }

  const handleLike = async () => {
    if (
      !likesArray.includes(currUserId) &&
      !dislikesArray.includes(currUserId)
    ) {
      const postRef = doc(db, "posts", postId);
      const new_likes = [currUserId, ...likesArray];
      setLikesArray([...new_likes]);

      await updateDoc(postRef, {
        likes: [...new_likes],
      });
    } else if (
      likesArray.includes(currUserId) &&
      !dislikesArray.includes(currUserId)
    ) {
      const postRef = doc(db, "posts", postId);
      const new_likes = likesArray.filter((like) => like !== currUserId);
      if (new_likes.length === 0) {
        setLikesArray([]);
      } else {
        setLikesArray([...new_likes]);
      }

      await updateDoc(postRef, {
        likes: [...new_likes],
      });
    } else if (
      !likesArray.includes(currUserId) &&
      dislikesArray.includes(currUserId)
    ) {
      const postRef = doc(db, "posts", postId);
      const new_dislikes = dislikesArray.filter(
        (dislike) => dislike !== currUserId
      );
      const new_likes = [currUserId, ...likesArray];

      if (new_dislikes.length === 0) {
        setDislikesArray([]);
      } else {
        setDislikesArray([...new_dislikes]);
      }
      setLikesArray([...new_likes]);

      await updateDoc(postRef, {
        dislikes: [...new_dislikes],
        likes: [...new_likes],
      });
    }
  };

  const handleDislike = async () => {
    if (
      !likesArray.includes(currUserId) &&
      !dislikesArray.includes(currUserId)
    ) {
      const postRef = doc(db, "posts", postId);
      const new_dislikes = [currUserId, ...dislikesArray];

      setDislikesArray([...new_dislikes]);

      await updateDoc(postRef, {
        dislikes: [...new_dislikes],
      });
    } else if (
      likesArray.includes(currUserId) &&
      !dislikesArray.includes(currUserId)
    ) {
      const postRef = doc(db, "posts", postId);
      const new_likes = likesArray.filter((like) => like !== currUserId);
      const new_dislikes = [currUserId, ...dislikesArray];
      if (new_likes.length === 0) {
        setLikesArray([]);
      } else {
        setLikesArray([...new_likes]);
      }

      setDislikesArray([...new_dislikes]);

      await updateDoc(postRef, {
        likes: [...new_likes],
        dislikes: [...new_dislikes],
      });
    } else if (
      !likesArray.includes(currUserId) &&
      dislikesArray.includes(currUserId)
    ) {
      const postRef = doc(db, "posts", postId);
      const new_dislikes = dislikesArray.filter(
        (dislike) => dislike !== currUserId
      );
      if (new_dislikes.length === 0) {
        setDislikesArray([]);
      } else {
        setDislikesArray([...new_dislikes]);
      }
      await updateDoc(postRef, {
        dislikes: [...new_dislikes],
      });
    }
  };

  const handleAddComment = async () => {
    const commentRef = await addDoc(
      collection(db, "posts", postId, "comments"),
      {
        user_docid: currUserId,
        timestamp: Timestamp.fromDate(new Date()),
        post_id: postId,
        comment_content: commentInput,
      }
    );
    const new_comments = [commentRef.id, ...comments];
    setComments([...new_comments]);
    setCommentInput("");
  };

  const handleComments = () => {
    setShowComments(!showComments);
  };

  const compressText = (content) => {
    if (content.length > 400) {
      const new_string = content.substr(0, 400);
      return new_string;
    } else {
      return content;
    }
  };

  return (
    <React.Fragment>
      {!loading && (
        <div className="post-complete">
          <div className="post">
            <div className="post-header">
              <div className="post-header-left">
                <img
                  src={
                    profilePicUrl
                      ? profilePicUrl
                      : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
                  }
                  alt="post-creator-img"
                  className="post-creator-image"
                />
                <div className="post-info">
                  <Link href={`/profile/${user_docid}`}>
                    <a>
                      <h2>
                        {firstName} {lastName}
                      </h2>
                    </a>
                  </Link>
                  <div className="post-info-details">
                    <span>{short_description}</span>

                    <span>Penned on {timestamp.toDate().toDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="display-category">
                <span>{category}</span>
              </div>
            </div>
            <div className="post-body">
              {isReadLess && (
                <Linkify>
                  <p>
                    {compressText(post_content)}
                    {post_content.length > 400 && <span>...</span>}
                  </p>
                </Linkify>
              )}
              {isReadMore && (
                <Linkify>
                  <p>{post_content}</p>
                </Linkify>
              )}
              {isReadLess && post_content.length > 400 && (
                <button
                  onClick={() => {
                    setReadLess(false);
                    setReadMore(true);
                  }}
                >
                  Read More
                </button>
              )}
              {isReadMore && (
                <button
                  onClick={() => {
                    setReadLess(true);
                    setReadMore(false);
                  }}
                >
                  Read less
                </button>
              )}
            </div>
            <div className="post-actions">
              <div className="post-action" onClick={handleLike}>
                {checkLiked() ? (
                  <span className="post-action-icon-checked">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flike%20icon%20blue.png?alt=media&token=1832caff-d1a3-4e5d-a697-0c8a56e86e71"
                      alt="like-grey"
                    />
                  </span>
                ) : (
                  <span className="post-action-icon-unchecked">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flike%20icon%20grey.png?alt=media&token=0648d219-b40e-4b3f-b8b5-bd226d66e29a"
                      alt="like-grey"
                    />
                  </span>
                )}

                <span className="post-action-type">Like</span>

                <span className="post-action-count">{likesArray.length}</span>
              </div>

              <div className="post-action" onClick={handleDislike}>
                {checkdisLiked() ? (
                  <span className="post-action-icon-checked">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fdislike%20blue.png?alt=media&token=cf2e5eea-0538-4c95-8af2-897db8c98092"
                      alt="dislike-grey"
                    />
                  </span>
                ) : (
                  <span className="post-action-icon-unchecked">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fdislike%20grey.png?alt=media&token=205466b8-7830-4b09-b91b-25aceb37b1b8"
                      alt="dislike-grey"
                    />
                  </span>
                )}

                <span className="post-action-type">Dislike</span>
                <span className="post-action-count">
                  {dislikesArray.length}
                </span>
              </div>

              <div className="post-action" onClick={handleComments}>
                <span className="post-action-icon-unchecked">
                  <img
                    src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fcomments%20grey.png?alt=media&token=d37980fa-f76d-4a4f-a04c-7a7674270330"
                    alt="comments-dots"
                  />
                </span>
                <span className="post-action-type">Comments</span>

                <span className="post-action-count">{comments.length}</span>
              </div>
            </div>

            {showComments && (
              <div className="comments-section">
                <div className="comments-section-box">
                  <div className="user-add-comment">
                    <img
                      src={
                        currUserPicLink
                          ? currUserPicLink
                          : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
                      }
                      alt="profile-pic"
                    />
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      onChange={(e) => setCommentInput(e.target.value)}
                      value={commentInput}
                    />

                    {commentInput === "" ? (
                      <button className=" user-add-comment-button disable-addComment">
                        Add
                      </button>
                    ) : (
                      <button
                        className="user-add-comment-button enable-addComment"
                        onClick={handleAddComment}
                      >
                        Add
                      </button>
                    )}
                  </div>
                  {comments.map((comment) => {
                    return (
                      <Comment
                        commentId={comment}
                        postId={postId}
                        key={comment}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {props.isSigned && (
            <div
              className="delete-content-button"
              onClick={() => {
                props.controlPostDeleteModal(true);
                props.getPostToDelete(postId);
              }}
            >
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fdustbin%20delete.png?alt=media&token=5b55d252-4c8e-4e60-9b76-98dd1ff748e9"
                alt="delete-icon"
                className="delete-button-white"
              />
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fdustbin%20red.png?alt=media&token=2af3d167-3f05-4fed-9359-865b3479b65d"
                alt="delete-icon"
                className="delete-button-red"
              />
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default Post;
