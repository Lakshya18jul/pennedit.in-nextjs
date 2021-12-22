import React, { useState, useEffect } from "react";
import { Header } from "./index.js";
// import "./SingleQuestionPage.css";
import { auth, db, storage } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import LoadingName from "./LoadingName";
import AnswerWithoutQues from "./AnswerWithoutQues.js";
import QuestionText from "./QuestionText.js";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom.js";
import { useRouter } from "next/router";
import Head from "next/head";
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
  Timestamp,
} from "firebase/firestore";

function SingleQuestionPage(props) {
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const router = useRouter();
  const questionId = props.questionId;
  //   const questionData = JSON.parse(props.questionData);
  //   const questionFirstAnswer = props.questionFirstAnswer;
  console.log("dbwg", props.questionSnap);

  const [loading, setLoading] = useState(true);
  const [typeAnswer, setTypeAnswer] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);

  const [dataToUse, setDataToUse] = useState({});
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [firstAnswerContent, setFirstAnswerContent] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    onAuthStateChanged(auth, async (user) => {
      if (!user || !auth.currentUser.emailVerified) {
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
    if (questionId) {
      const questionRef = doc(db, "questions", questionId);
      const questionSnap = await getDoc(questionRef);

      if (!questionSnap.exists()) {
        router.push("/404");
        return;
      }

      if (questionSnap.exists()) {
        const data = questionSnap.data();
        setDataToUse(data);

        const answersRef = collection(db, "answers");

        const getAllAnswers = query(
          answersRef,
          where("question_id", "==", questionId),
          orderBy("timestamp")
        );

        const queryAnswersSnapshot = await getDocs(getAllAnswers);
        queryAnswersSnapshot.forEach((singleAnswer) => {
          if (firstAnswerContent === "") {
            setFirstAnswerContent(singleAnswer.data().answer_content);
          }
        });

        const categoryRef = doc(db, "categories", data.category);
        const categorySnap = await getDoc(categoryRef);

        if (
          categorySnap.exists() &&
          categorySnap.data().questionIds.length !== 0
        ) {
          setRelatedQuestions([...categorySnap.data().questionIds]);
        }
        setLoading(false);
      }

      if (currUserState) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", currUserState.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          doc.data().answers.map((answer) => {
            if (answer.question_id === questionId && !isAnswered) {
              setIsAnswered(true);
            }
          });
        });
      }
    }
  }, [currUserState]);

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

        if (curr_user_docid !== dataToUse.user_docid) {
          const notificationRef = await addDoc(
            collection(db, "users", dataToUse.user_docid, "notifications"),
            {
              timestamp: Timestamp.fromDate(new Date()),
              answerer_docid: curr_user_docid,
              question_answered: questionId,
              isViewed: false,
            }
          );
        }

        setIsAnswered(true);
      } else {
        router.push("/404");
        return;
      }
    };

    addNewAnswer();
    setAnswerText("");
    setTypeAnswer(false);
  };

  const handleQuestionClick = (question_id) => {
    router.push(`/question/${question_id}`);
    window.location.reload();
  };

  const handleUnsignedClick = () => {
    router.push(`/`);
  };

  return (
    <div className="single-question-page">
      {!loading && (
        <React.Fragment>
          <Head>
            {firstAnswerContent === "" ? (
              <meta
                name="description"
                content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
              />
            ) : (
              <meta name="description" content={firstAnswerContent} />
            )}

            <title>
              {`(${dataToUse.answers.length})`} {dataToUse.question_content} –
              Pennedit.in
            </title>
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
          <div className="question-page-body">
            <div className="question-page-content">
              <div className="question-page-display-question-answers">
                <div className="question-page-display-question">
                  <div className="question-page-show-question">
                    {dataToUse.question_content}
                  </div>

                  <div className="question-page-question-state">
                    {auth.currentUser && !isAnswered && (
                      <div
                        className="answer-box"
                        onClick={() => setTypeAnswer(true)}
                      >
                        <span>
                          <i className="fas fa-edit"></i>
                        </span>

                        <span>Answer</span>
                      </div>
                    )}

                    {auth.currentUser && isAnswered && (
                      <div className="answer-box">
                        <span>
                          <i className="fas fa-edit"></i>
                        </span>

                        <span>Answered</span>
                      </div>
                    )}

                    {!auth.currentUser && (
                      <div className="answer-box" onClick={handleUnsignedClick}>
                        <span>Sign in</span>
                      </div>
                    )}

                    <div className="display-category">
                      <span className="chosen-category">
                        {dataToUse.category}
                      </span>
                    </div>
                  </div>

                  {typeAnswer && (
                    <div className="question-page-user-answer">
                      <textarea
                        placeholder="Type your answer..."
                        onChange={(e) => setAnswerText(e.target.value)}
                        value={answerText}
                      ></textarea>
                      <div className="question-page-user-answer-buttons">
                        {answerText === "" ? (
                          <button className="submit-answer-disabled">
                            Pen My Answer
                          </button>
                        ) : (
                          <button
                            className="submit-answer"
                            onClick={handlePublishAnswer}
                          >
                            Pen My Answer
                          </button>
                        )}

                        <button
                          className="cancel-answer"
                          onClick={() => {
                            setTypeAnswer(false);
                            setAnswerText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="question-page-display-answers">
                  <div className="question-page-display-answers-header">
                    <div className="question-page-display-answers-heading-segment">
                      <div className="display-answers-heading">Answers</div>
                      <div className="display-answers-count">
                        {dataToUse.answers.length}
                      </div>
                    </div>
                  </div>

                  <div className="question-page-display-answers-allAnswers">
                    {dataToUse.answers.length !== 0 &&
                      dataToUse.answers.map((answerId) => {
                        return (
                          <AnswerWithoutQues
                            answerId={answerId}
                            key={answerId}
                          />
                        );
                      })}

                    {dataToUse.answers.length === 0 && (
                      <div className="no-posts-present">
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2FEmpty%20box.png?alt=media&token=0373a2e4-4c2e-430b-b227-1ef902a7f218"
                          alt="no-posts"
                        />
                        <span>No answers yet</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="question-page-other-questions">
                <div className="question-page-other-questions-header">
                  <span>Related Questions</span>
                </div>

                <div className="question-page-display-questions">
                  {relatedQuestions.map((question_id) => {
                    if (question_id !== questionId) {
                      return (
                        <div
                          className="question-page-single-question"
                          onClick={() => handleQuestionClick(question_id)}
                        >
                          <QuestionText
                            questionId={question_id}
                            key={question_id}
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      )}
      {/* {loading && (
        <Head>
          {questionFirstAnswer === "" ? (
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
          ) : (
            <meta
              name="description"
              content={`${questionData.answers.length} Answers - ${questionFirstAnswer}`}
            />
          )}

          <title>
            {`(${questionData.answers.length})`} {questionData.question_content}{" "}
            – Pennedit.in
          </title>
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
      )} */}
    </div>
  );
}

export default SingleQuestionPage;
