import React, { useEffect, useState } from "react";
// import "./Following.css";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { useRecoilState } from "recoil";
import { userState } from "../atoms/userAtom";
import { useRouter } from "next/router";
import Head from "next/head";

import {
  Header,
  FollowingProfile,
  HomeLeftSidebar,
  RightSidebar,
} from "./index.js";

function Following(props) {
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (currUserState) {
      setLoading(false);
    }
  }, [currUserState]);

  return (
    <div className="following">
      {!loading && (
        <React.Fragment>
          <Head>
            <meta
              name="description"
              content="Pennedit is a question-and-answer website which allows users to post, ask questions and answer others based on their favourite categories and keep themselves updated regarding the latest developments in their field of interest. "
            />
            <title>Pennedit.in – Following</title>
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
          <div className="following-page">
            <div className="following-section">
              <HomeLeftSidebar />
              <div className="following-content">
                <div className="following-count-display">
                  <span>Following</span>
                  <span className="following-count">
                    {currUserState.following.length}
                  </span>
                </div>
                {currUserState.following.length !== 0 &&
                  currUserState.following.map((followingId) => {
                    return (
                      <FollowingProfile
                        followingId={followingId}
                        key={followingId}
                      />
                    );
                  })}

                {currUserState.following.length === 0 && (
                  <div className="no-following">
                    <i className="fas fa-paper-plane"></i>
                    <span>No following found</span>
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

export default Following;
