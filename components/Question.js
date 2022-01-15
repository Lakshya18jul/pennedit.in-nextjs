import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase.js";
import Link from "next/link";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import Linkify from "react-linkify";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
// import "./Question.css";

import dynamic from "next/dynamic";
import { EditorState } from "draft-js";
import { convertFromRaw, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((module) => module.Editor),
  {
    ssr: false,
  }
);

function Question(props) {
  const [dataToUse, setDataToUse] = useState({});
  const { questionId } = props;
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const router = useRouter();

  const {
    firstName,
    lastName,
    short_description,
    timestamp,
    question_content,
    user_docid,
    category,
    answers,
  } = dataToUse;

  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [answersLength, setAnswersLength] = useState(0);

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
    let unsub;
    if (currUserState) {
      let profilePic = {};

      const questionRef = doc(db, "questions", questionId);
      const questionSnap = await getDoc(questionRef);

      if (questionSnap.exists()) {
        const data = questionSnap.data();
        setAnswersLength(data.answers.length);
        const user_docid = questionSnap.data().user_docid;
        const new_data = await addUserData(user_docid, data);
        setDataToUse(new_data);
        profilePic = new_data.profilePic;

        if (JSON.stringify(profilePic) === "{}") {
          setProfilePicUrl(null);
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("uid", "==", currUserState.uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            doc.data().answers.map((answer) => {
              if (answer.question_id === questionId && !answered) {
                setAnswered(true);
              }
            });
          });
          setLoading(false);
        } else {
          const imageRef = ref(
            storage,
            `images/${user_docid}/${profilePic.name}`
          );
          getDownloadURL(imageRef)
            .then(async (url) => {
              setProfilePicUrl(url);
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("uid", "==", currUserState.uid));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((doc) => {
                doc.data().answers.map((answer) => {
                  if (answer.question_id === questionId && !answered) {
                    setAnswered(true);
                  }
                });
              });
              setLoading(false);
            })
            .catch((error) => {
              alert(" Error in downloading the url");
            });
        }
      }
    }
  }, [currUserState]);

  const [answerBox, setAnswerBox] = useState(false);
  const [answerText, setAnswerText] = useState("");

  const handlePublishAnswer = async () => {
    let curr_user_docid;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", currUserState.uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      curr_user_docid = doc.id;
    });

    const addNewAnswer = async () => {
      const new_answer = await addDoc(collection(db, "answers"), {
        user_docid: curr_user_docid,
        question_id: questionId,
        timestamp: Timestamp.fromDate(new Date()),
        answer_content: answerText,
        likes: [],
        dislikes: [],
      });

      const questionRef = doc(db, "questions", questionId);
      const questionSnap = await getDoc(questionRef);

      if (questionSnap.exists()) {
        const question_answers = questionSnap.data().answers;
        await updateDoc(questionRef, {
          answers: [new_answer.id, ...question_answers],
        });
        querySnapshot.forEach(async (user) => {
          const userRef = doc(db, "users", user.id);
          const prev_answers = user.data().answers;
          const answer_obj = {
            question_id: questionId,
            answer_id: new_answer.id,
          };
          await updateDoc(userRef, {
            answers: [answer_obj, ...prev_answers],
          });
        });

        if (curr_user_docid !== user_docid) {
          const notificationRef = await addDoc(
            collection(db, "users", user_docid, "notifications"),
            {
              timestamp: Timestamp.fromDate(new Date()),
              answerer_docid: curr_user_docid,
              question_answered: questionId,
              isViewed: false,
            }
          );
        }

        setAnswered(true);
        setAnswersLength(answersLength + 1);
      } else {
        router.push("/404");
        return;
      }
    };

    addNewAnswer();
    setAnswerText("");
    setEditorAnswerState(EditorState.createEmpty());
    setAnswerBox(false);
  };

  const [editorAnswerState, setEditorAnswerState] = useState(
    EditorState.createEmpty()
  );

  const onEditorAnswerStateChange = (editorAnswerState) => {
    setEditorAnswerState(editorAnswerState);
    setAnswerText(
      draftToHtml(convertToRaw(editorAnswerState.getCurrentContent()))
    );
  };

  return (
    <React.Fragment>
      {!loading && (
        <div className="question-complete">
          <div className="question">
            <div className="question-header">
              <div className="question-header-left">
                <img
                  src={
                    profilePicUrl
                      ? profilePicUrl
                      : "https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fuser%20avatar.png?alt=media&token=2cab7ab4-6d8b-4f94-9113-87db6b4015f1"
                  }
                  alt="question-creator-img"
                  className="question-creator-image"
                />
                <div className="question-info">
                  <Link href={`/profile/${user_docid}`}>
                    <a>
                      <h2>
                        {firstName} {lastName}
                      </h2>
                    </a>
                  </Link>
                  <div className="question-info-details">
                    <span>{short_description}</span>

                    <span>Asked on {timestamp.toDate().toDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="display-category">
                <span>{category}</span>
              </div>
            </div>

            <div className="question-body">
              <Linkify>
                <h3>{question_content}</h3>
              </Linkify>

              {answerBox && (
                <Editor
                  editorState={editorAnswerState}
                  onEditorStateChange={onEditorAnswerStateChange}
                  toolbar={{
                    options: ["inline", "list"],
                    inline: {
                      options: ["bold", "italic", "underline"],
                    },
                  }}
                  className="editor-typing"
                />
              )}
            </div>

            <div className="question-actions">
              {!answerBox && (
                <Link href={`/question/${questionId}`}>
                  <div className="question-action">
                    <span>
                      <img
                        src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fanswers%20grey.png?alt=media&token=20a6c207-29cf-4e7e-a5a5-0839324f2cf1"
                        alt="answers-icon"
                      />
                    </span>
                    <span>Answers</span>
                    <div className="question-answers-length">
                      {answersLength}
                    </div>
                  </div>
                </Link>
              )}

              {answered && (
                <div className="question-action">
                  <span>
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fpen%20paper%20grey.png?alt=media&token=11b3df91-a400-4bda-b626-281f5389be0e"
                      alt="answer-icon"
                    />
                  </span>

                  <span>Answered</span>
                </div>
              )}

              {!answerBox && !answered && (
                <div
                  className="question-action"
                  onClick={() => setAnswerBox(true)}
                >
                  <span>
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fpen%20paper%20grey.png?alt=media&token=11b3df91-a400-4bda-b626-281f5389be0e"
                      alt="answer-icon"
                    />
                  </span>

                  <span>Answer</span>
                </div>
              )}

              {answerBox && answerText.length > 8 && (
                <button className="submit-answer" onClick={handlePublishAnswer}>
                  Pen My Answer
                </button>
              )}

              {answerBox && answerText.length <= 8 && (
                <button className="submit-answer-disabled">
                  Pen My Answer
                </button>
              )}

              {answerBox && (
                <button
                  className="cancel-answer"
                  onClick={() => {
                    setAnswerBox(false);
                    setAnswerText("");
                    setEditorAnswerState(EditorState.createEmpty());
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          {props.isSigned && (
            <div
              className="delete-content-button"
              onClick={() => {
                props.controlQuestionDeleteModal(true);
                props.getQuestionToDelete(questionId);
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

export default Question;
