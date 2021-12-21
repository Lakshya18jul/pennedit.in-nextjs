import React, { useEffect, useState } from "react";
import { Header, RightSidebar, HomeLeftSidebar, Question } from "./index.js";
// import "./Answer.css";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db, storage } from "../firebase.js";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import Head from "next/head";

function Answer(props) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const router = useRouter();

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
    const q = query(collection(db, "questions"), orderBy("timestamp", "desc"));

    const querySnapshot = await getDocs(q);

    let final_questions = [];
    querySnapshot.forEach((question) => {
      final_questions.push(question.id);
      setQuestions([...final_questions]);
    });
  }, []);

  useEffect(() => {
    if (currUserState != null) {
      setLoading(false);
    }
  }, [currUserState]);

  return (
    <div className="answer">
      {!loading && (
        <React.Fragment>
          <Head>
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
            <title>Pennedit.in – Answer</title>
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
          <div className="answer-page">
            <div className="answer-section">
              <HomeLeftSidebar />
              <div className="answer-content">
                {questions.map((question) => {
                  return <Question questionId={question} key={question} />;
                })}
              </div>
              <RightSidebar />
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default Answer;
