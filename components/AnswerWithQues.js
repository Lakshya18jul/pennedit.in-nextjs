import React, { useState, useEffect } from "react";
// import "./AnswerWithQues.css";
import { db, storage } from "../firebase.js";
import Link from "next/link";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Linkify from "react-linkify";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";

function AnswerWithQues(props) {
  const [dataToUse, setDataToUse] = useState({});
  const { answerId } = props;

  const [currUserState, setCurrUserState] = useRecoilState(userState);

  const [currUserId, setCurrUserId] = useState("");

  const [isReadMore, setReadMore] = useState(false);
  const [isReadLess, setReadLess] = useState(true);

  const {
    firstName,
    lastName,
    short_description,
    timestamp,
    answer_content,
    user_docid,
    likes,
    dislikes,
  } = dataToUse;

  const [loading, setLoading] = useState(true);
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  const [questionContent, setQuestionContent] = useState("");

  const [likesArray, setLikesArray] = useState([]);
  const [dislikesArray, setDislikesArray] = useState([]);

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
    const answerRef = doc(db, "answers", answerId);
    const answerSnap = await getDoc(answerRef);

    if (answerSnap.exists()) {
      const data = answerSnap.data();
      setLikesArray([...data.likes]);
      setDislikesArray([...data.dislikes]);
      const user_docid = answerSnap.data().user_docid;
      const new_data = await addUserData(user_docid, data);
      setDataToUse(new_data);
      profilePic = new_data.profilePic;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", currUserState.uid));

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((user) => {
        setCurrUserId(user.id);
      });

      if (JSON.stringify(profilePic) === "{}") {
        setProfilePicUrl(null);
        const questionRef = doc(db, "questions", new_data.question_id);
        const questionSnap = await getDoc(questionRef);

        setQuestionContent(questionSnap.data().question_content);

        setLoading(false);
      } else {
        const imageRef = ref(
          storage,
          `images/${user_docid}/${profilePic.name}`
        );
        getDownloadURL(imageRef)
          .then(async (url) => {
            setProfilePicUrl(url);
            const questionRef = doc(db, "questions", new_data.question_id);
            const questionSnap = await getDoc(questionRef);

            setQuestionContent(questionSnap.data().question_content);
            setLoading(false);
          })
          .catch((error) => {
            alert("Error in downloading the url");
          });
      }
    }
  }, []);

  const compressText = (content) => {
    if (content.length > 400) {
      const new_string = content.substr(0, 400);
      return new_string;
    } else {
      return content;
    }
  };

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
      const answerRef = doc(db, "answers", answerId);
      const new_likes = [currUserId, ...likesArray];
      setLikesArray([...new_likes]);

      await updateDoc(answerRef, {
        likes: [...new_likes],
      });
    } else if (
      likesArray.includes(currUserId) &&
      !dislikesArray.includes(currUserId)
    ) {
      const answerRef = doc(db, "answers", answerId);
      const new_likes = likesArray.filter((like) => like !== currUserId);
      if (new_likes.length === 0) {
        setLikesArray([]);
      } else {
        setLikesArray([...new_likes]);
      }

      await updateDoc(answerRef, {
        likes: [...new_likes],
      });
    } else if (
      !likesArray.includes(currUserId) &&
      dislikesArray.includes(currUserId)
    ) {
      const answerRef = doc(db, "answers", answerId);
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

      await updateDoc(answerRef, {
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
      const answerRef = doc(db, "answers", answerId);
      const new_dislikes = [currUserId, ...dislikesArray];

      setDislikesArray([...new_dislikes]);

      await updateDoc(answerRef, {
        dislikes: [...new_dislikes],
      });
    } else if (
      likesArray.includes(currUserId) &&
      !dislikesArray.includes(currUserId)
    ) {
      const answerRef = doc(db, "answers", answerId);
      const new_likes = likesArray.filter((like) => like !== currUserId);
      const new_dislikes = [currUserId, ...dislikesArray];
      if (new_likes.length === 0) {
        setLikesArray([]);
      } else {
        setLikesArray([...new_likes]);
      }

      setDislikesArray([...new_dislikes]);

      await updateDoc(answerRef, {
        likes: [...new_likes],
        dislikes: [...new_dislikes],
      });
    } else if (
      !likesArray.includes(currUserId) &&
      dislikesArray.includes(currUserId)
    ) {
      const answerRef = doc(db, "answers", answerId);
      const new_dislikes = dislikesArray.filter(
        (dislike) => dislike !== currUserId
      );
      if (new_dislikes.length === 0) {
        setDislikesArray([]);
      } else {
        setDislikesArray([...new_dislikes]);
      }
      await updateDoc(answerRef, {
        dislikes: [...new_dislikes],
      });
    }
  };

  return (
    <React.Fragment>
      {!loading && (
        <div className="answerWithQues-complete">
          <div className="answerWithQues">
            <div className="answerWithQues-header">
              <img
                src={
                  profilePicUrl
                    ? profilePicUrl
                    : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
                }
                alt="answerWithQues-creator-img"
                className="answerWithQues-creator-image"
              />
              <div className="answerWithQues-info">
                <Link href={`/profile/${user_docid}`}>
                  <a>
                    <h2>
                      {firstName} {lastName}
                    </h2>
                  </a>
                </Link>
                <div className="answerWithQues-info-details">
                  <span>{short_description}</span>

                  <span>Answered on {timestamp.toDate().toDateString()}</span>
                </div>
              </div>
            </div>

            <div className="answerWithQues-body">
              <h3>{questionContent}</h3>
              {isReadLess && (
                <Linkify>
                  <p>
                    {compressText(answer_content)}
                    {answer_content.length > 400 && <span>...</span>}
                  </p>
                </Linkify>
              )}
              {isReadMore && (
                <Linkify>
                  <p>{answer_content}</p>
                </Linkify>
              )}
              {isReadLess && answer_content.length > 400 && (
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

            <div className="answerWithQues-actions">
              <div className="answerWithQues-action" onClick={handleLike}>
                {checkLiked() ? (
                  <span className="answerWithQues-icon-checked">
                    <i class="far fa-thumbs-up"></i>
                  </span>
                ) : (
                  <span className="answerWithQues-icon-unchecked">
                    <i class="far fa-thumbs-up"></i>
                  </span>
                )}

                <span className="answerWithQues-type">Like</span>
                <span className="answerWithQues-count">
                  {likesArray.length}
                </span>
              </div>

              <div className="answerWithQues-action" onClick={handleDislike}>
                {checkdisLiked() ? (
                  <span className="answerWithQues-icon-checked">
                    <i class="far fa-thumbs-down"></i>
                  </span>
                ) : (
                  <span className="answerWithQues-icon-unchecked">
                    <i class="far fa-thumbs-down"></i>
                  </span>
                )}

                <span className="answerWithQues-type">Dislike</span>
                <span className="answerWithQues-count">
                  {" "}
                  {dislikesArray.length}
                </span>
              </div>
            </div>
          </div>
          {props.isSigned && (
            <div
              className="delete-content-button"
              onClick={() => {
                props.controlAnswerModal(true);
                props.getAnswerToDelete(answerId);
              }}
            >
              <i class="far fa-trash-alt"></i>
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default AnswerWithQues;
