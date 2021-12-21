import React, { useEffect, useState } from "react";
// import "./Comment.css";
import { db, storage } from "../firebase.js";
import { getDoc, doc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

function Comment(props) {
  const [loading, setLoading] = useState(true);
  const [profileImageLink, setProfileImageLink] = useState(null);
  const [dataToUse, setDataToUse] = useState({});

  const { commentId, postId } = props;

  const { firstName, lastName, timestamp, comment_content } = dataToUse;

  useEffect(async () => {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const data = commentSnap.data();

    const userRef = doc(db, "users", data.user_docid);
    const userSnap = await getDoc(userRef);
    data["firstName"] = userSnap.data().firstName;
    data["lastName"] = userSnap.data().lastName;

    setDataToUse(data);

    if (JSON.stringify(userSnap.data().profilePic) === "{}") {
      setProfileImageLink(null);
      setLoading(false);
    } else {
      const imageRef = ref(
        storage,
        `images/${data.user_docid}/${userSnap.data().profilePic.name}`
      );
      getDownloadURL(imageRef)
        .then((url) => {
          setProfileImageLink(url);
          setLoading(false);
        })
        .catch((error) => {
          alert("Error encountered in downloading the URL");
        });
    }
  }, []);

  return (
    <React.Fragment>
      {!loading && (
        <div className="comment">
          <img
            src={
              profileImageLink
                ? profileImageLink
                : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
            }
            alt="comment-pic"
          />
          <div className="comment-body">
            <span>
              {firstName} {lastName} commented on{" "}
              {timestamp.toDate().toDateString()}
            </span>
            <p>{comment_content}</p>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

export default Comment;
