import React, { useState, useEffect } from "react";
// import "./Page404.css";
import { Header } from "./index";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase.js";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import Head from "next/head";

import { collection, query, where, getDocs } from "firebase/firestore";

function Page404(props) {
  const [loading, setLoading] = useState(true);
  const [currUserState, setCurrUserState] = useRecoilState(userState);
  useEffect(async () => {
    window.scrollTo(0, 0);
    onAuthStateChanged(auth, async (user) => {
      if (!user || !auth.currentUser.emailVerified) {
      } else if (user && auth.currentUser.emailVerified) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          setCurrUserState(doc.data());
        });
      }
      setLoading(false);
    });
  }, []);
  return (
    <React.Fragment>
      {!loading && (
        <div className="page404-content">
          <Head>
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
            <title>Pennedit - 404 Page Not Found</title>
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
          <Header />
          <div className="page-not-found">
            <div className="page-error-code">404</div>
            <div className="page-error-message">Page Not Found</div>
          </div>
        </div>
      )}
      {loading && (
        <Head>
          <meta
            name="description"
            content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
          />
          <title>Pennedit - 404 Page Not Found</title>
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
      )}
    </React.Fragment>
  );
}

export default Page404;
