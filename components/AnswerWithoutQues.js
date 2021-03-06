import React, { useState, useEffect } from "react";
// import "./AnswerWithQues.css";
import { db, storage } from "../firebase.js";
import Link from "next/link";
import Linkify from "react-linkify";
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
import { ref, getDownloadURL } from "firebase/storage";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
function AnswerWithoutQues(props) {
  const [dataToUse, setDataToUse] = useState({});
  const { answerId } = props;

  const [currUserId, setCurrUserId] = useState("");
  const [currUserState, setCurrUserState] = useRecoilState(userState);

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

  const [likesArray, setLikesArray] = useState([]);
  const [dislikesArray, setDislikesArray] = useState([]);

  const [isReadMore, setReadMore] = useState(false);
  const [isReadLess, setReadLess] = useState(true);

  const compressText = (content) => {
    if (content.length > 400) {
      const new_string = content.substr(0, 400);
      return (
        <>
          <p dangerouslySetInnerHTML={{ __html: new_string }} />
          <span>...</span>
        </>
      );
    } else {
      return <p dangerouslySetInnerHTML={{ __html: content }} />;
    }
  };

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

      if (currUserState) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", currUserState.uid));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((user) => {
          setCurrUserId(user.id);
        });
      }

      if (JSON.stringify(profilePic) === "{}") {
        setProfilePicUrl(null);
        setLoading(false);
      } else {
        const imageRef = ref(
          storage,
          `images/${user_docid}/${profilePic.name}`
        );
        getDownloadURL(imageRef)
          .then(async (url) => {
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
              {isReadLess && <Linkify>{compressText(answer_content)}</Linkify>}
              {isReadMore && (
                <Linkify>
                  <p dangerouslySetInnerHTML={{ __html: answer_content }} />
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
              {currUserState && (
                <div className="answerWithQues-action" onClick={handleLike}>
                  {checkLiked() ? (
                    <span className="answerWithQues-icon-checked">
                      <img
                        src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flike%20icon%20blue.png?alt=media&token=1832caff-d1a3-4e5d-a697-0c8a56e86e71"
                        alt="like-grey"
                      />
                    </span>
                  ) : (
                    <span className="answerWithQues-icon-unchecked">
                      <img
                        src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flike%20icon%20grey.png?alt=media&token=0648d219-b40e-4b3f-b8b5-bd226d66e29a"
                        alt="like-grey"
                      />
                    </span>
                  )}

                  <span className="answerWithQues-type">Like</span>
                  <span className="answerWithQues-count">
                    {likesArray.length}
                  </span>
                </div>
              )}

              {!currUserState && (
                <div className="answerWithQues-action">
                  <span className="answerWithQues-icon-unchecked">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flike%20icon%20grey.png?alt=media&token=0648d219-b40e-4b3f-b8b5-bd226d66e29a"
                      alt="like-grey"
                    />
                  </span>

                  <span className="answerWithQues-type">Like</span>
                  <span className="answerWithQues-count">
                    {likesArray.length}
                  </span>
                </div>
              )}

              {currUserState && (
                <div className="answerWithQues-action" onClick={handleDislike}>
                  {checkdisLiked() ? (
                    <span className="answerWithQues-icon-checked">
                      <img
                        src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fdislike%20blue.png?alt=media&token=cf2e5eea-0538-4c95-8af2-897db8c98092"
                        alt="dislike-grey"
                      />
                    </span>
                  ) : (
                    <span className="answerWithQues-icon-unchecked">
                      <img
                        src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fdislike%20grey.png?alt=media&token=205466b8-7830-4b09-b91b-25aceb37b1b8"
                        alt="dislike-grey"
                      />
                    </span>
                  )}

                  <span className="answerWithQues-type">Dislike</span>
                  <span className="answerWithQues-count">
                    {" "}
                    {dislikesArray.length}
                  </span>
                </div>
              )}

              {!currUserState && (
                <div className="answerWithQues-action">
                  <span className="answerWithQues-icon-unchecked">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fdislike%20grey.png?alt=media&token=205466b8-7830-4b09-b91b-25aceb37b1b8"
                      alt="dislike-grey"
                    />
                  </span>

                  <span className="answerWithQues-type">Dislike</span>
                  <span className="answerWithQues-count">
                    {" "}
                    {dislikesArray.length}
                  </span>
                </div>
              )}
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
              <i className="far fa-trash-alt"></i>
            </div>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default AnswerWithoutQues;
