import React, { useEffect, useState } from "react";

import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
// import "./Notifications.css";
import Link from "next/link";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom.js";
import Head from "next/head";
import { useRouter } from "next/router";

import { Header, HomeLeftSidebar, RightSidebar } from "./index.js";
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

function Notifications(props) {
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  const [loading, setLoading] = useState(true);
  const [notificationsArray, setNotificationsArray] = useState([]);
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
    if (currUserState) {
      let curr_signed_user;
      const q1 = query(
        collection(db, "users"),
        where("uid", "==", currUserState.uid)
      );

      const querySnapshot1 = await getDocs(q1);
      querySnapshot1.forEach((user) => {
        curr_signed_user = user.id;
      });

      const q2 = query(
        collection(db, "users", curr_signed_user, "notifications"),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q2, (notificationSnapshot) => {
        let all_notifications = [];
        notificationSnapshot.forEach(async (notification) => {
          const answererRef = doc(
            db,
            "users",
            notification.data().answerer_docid
          );
          const answererSnap = await getDoc(answererRef);
          let answerer_name =
            answererSnap.data().firstName + " " + answererSnap.data().lastName;

          const questionAnsweredRef = doc(
            db,
            "questions",
            notification.data().question_answered
          );
          const questionAnsweredSnap = await getDoc(questionAnsweredRef);

          let question_content = questionAnsweredSnap.data().question_content;
          let question_id = questionAnsweredSnap.id;

          let notification_content = {
            answerer_name,
            question_content,
            isViewed: notification.data().isViewed,
            question_id,
            notificationId: notification.id,
          };

          all_notifications.push(notification_content);
          setNotificationsArray([...all_notifications]);
        });
      });

      setLoading(false);

      return () => unsubscribe();
    }
  }, [currUserState]);

  return (
    <div className="notifications">
      {!loading && (
        <React.Fragment>
          <Head>
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
            <title>Pennedit.in – Notifications</title>
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
          <div className="notifications-page">
            <div className="notifications-section">
              <HomeLeftSidebar />
              <div className="notifications-content">
                {notificationsArray.length !== 0 &&
                  notificationsArray.map((notificationData) => {
                    return (
                      <div
                        className="single-notification"
                        key={notificationData.notificationId}
                      >
                        <img
                          src="https://firebasestorage.googleapis.com/v0/b/pennedit-d53c8.appspot.com/o/pennedit-inapp-images%2Fanswer%20icon.png?alt=media&token=44a43512-1a7b-4fc3-9e4b-ce37975ea52c"
                          alt="answer-notification"
                          className="answer-notification-image"
                        />

                        <div className="notification-data">
                          <Link
                            href={`/question/${notificationData.question_id}`}
                          >
                            <a>
                              <span>
                                {notificationData.answerer_name} has answered
                                your question{" "}
                                {notificationData.question_content}
                              </span>
                            </a>
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                {notificationsArray.length === 0 && (
                  <div className="no-following">
                    <i className="fas fa-bell"></i>
                    <span>No notification found</span>
                  </div>
                )}
              </div>
              <RightSidebar />
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default Notifications;
